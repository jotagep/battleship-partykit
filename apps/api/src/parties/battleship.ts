import {
  applyShotToFleet,
  type Coordinate,
  type FleetPlacement,
  type FleetState,
  type GamePhase,
  isFleetSunk,
  isWithinBoard,
  toInitialFleetState,
  validateFleetPlacement,
} from '@repo/shared/battleship'
import {
  type BattleshipClientMessage,
  type BattleshipServerMessage,
  type ChatMessage,
  type InfoMessage,
  isClientMessage,
  RoomCloseCode,
  type ShotRecord,
} from '@repo/shared/messages'
import { eq } from 'drizzle-orm'
import { type Connection, type ConnectionContext, Server, type WSMessage } from 'partyserver'

import { auth } from '../auth'
import { game, type User } from '../db/schema'
import { getDB } from '../db/utils'
import type { BindingsEnv } from '../types/env'

const decoder = new TextDecoder()

function toText(message: WSMessage): string {
  if (typeof message === 'string') return message
  if (message instanceof ArrayBuffer) return decoder.decode(message)
  return decoder.decode(message.buffer)
}
interface PlayerState {
  user: User
  fleet?: FleetState
  shotsFired?: Coordinate[]
}

interface ConnectionState {
  user: User
  role: 'player1' | 'player2'
}

interface GameState {
  phase: GamePhase
  turn: 'player1' | 'player2'
  winner?: 'player1' | 'player2'
  players: Partial<Record<'player1' | 'player2', PlayerState>>
}

export class Battleship extends Server<BindingsEnv> {
  messageHistory: string[] = []
  game: GameState = {
    phase: 'preparing',
    turn: 'player1',
    players: {},
  }

  private fleetStateToPlacement(fleet?: FleetState): FleetPlacement | undefined {
    if (!fleet) return undefined
    return fleet.map(({ hits: _hits, ...placement }) => placement)
  }

  private getShotsWithResults(
    shots: Coordinate[] | undefined,
    targetFleet: FleetState | undefined,
  ): ShotRecord[] {
    if (!shots || !targetFleet) return []

    return shots.map((shot) => {
      const { result } = applyShotToFleet(targetFleet, shot)
      return { x: shot.x, y: shot.y, result }
    })
  }

  private sendStateToConnection(connection: Connection<ConnectionState>): void {
    const player = this.getPlayerByConnection(connection)
    if (!player) return

    const opponentRole = player.role === 'player1' ? 'player2' : 'player1'
    const opponent = this.game.players[opponentRole]

    const myShots = this.getShotsWithResults(player.state.shotsFired, opponent?.fleet)
    const opponentShots = this.getShotsWithResults(opponent?.shotsFired, player.state.fleet)

    const player1 = this.game.players.player1?.user
    const player2 = this.game.players.player2?.user

    const stateMessage: BattleshipServerMessage = {
      type: 'state',
      you: player.role,
      phase: this.game.phase,
      turn: this.game.turn,
      winner: this.game.winner,
      fleet: this.fleetStateToPlacement(player.state.fleet),
      myShots,
      opponentShots,
      players:
        player1 && player2
          ? {
              player1: { name: player1.name ?? player1.id },
              player2: { name: player2.name ?? player2.id },
            }
          : undefined,
    }
    connection.send(JSON.stringify(stateMessage))
  }

  private broadcastState(): void {
    for (const conn of this.getConnections<ConnectionState>()) {
      this.sendStateToConnection(conn)
    }
  }

  onStart(): void | Promise<void> {
    // void this.sql`
    //   CREATE TABLE IF NOT EXISTS game (
    //     id TEXT PRIMARY KEY,
    //     snapshot TEXT NOT NULL
    //   )
    // `
  }

  async onConnect(connection: Connection<ConnectionState>, ctx: ConnectionContext): Promise<void> {
    const cookie = ctx.request.headers.get('cookie') ?? ''

    const response = await auth(this.env).api.getSession({ headers: { cookie } })

    if (!response || !response.session || !response.user) {
      connection.close(RoomCloseCode.UNAUTHORIZED, 'Unauthorized')
      return
    }

    // Check game access here if needed (e.g., access codes)
    const db = getDB(this.env)

    const gameData = await db.query.game.findFirst({
      where: eq(game.id, this.name),
    })
    if (!gameData) {
      connection.close(RoomCloseCode.ROOM_NOT_FOUND, 'Game not found')
      return
    }

    if (gameData.player1Id !== response.user.id && gameData.player2Id !== response.user.id) {
      connection.close(RoomCloseCode.UNAUTHORIZED, 'Unauthorized')
      return
    }

    const user: User = response.user as User

    // Determine which player this connection belongs to
    const playerRole = user.id === gameData.player1Id ? 'player1' : 'player2'

    connection.setState({ user, role: playerRole })

    // Check if player is reconnecting (already has state)
    const existingPlayer = this.game.players[playerRole]
    if (existingPlayer) {
      const reconnectMessage: InfoMessage = {
        type: 'info',
        message: `${user.name ?? user.id} has reconnected to the battle`,
      }
      this.broadcast(JSON.stringify(reconnectMessage), [connection.id])

      // Send current state back to the reconnecting player
      this.sendStateToConnection(connection)
    } else {
      // New connection - initialize player state
      this.game.players[playerRole] = {
        user,
        shotsFired: [],
      }

      const welcomeMessage: InfoMessage = {
        type: 'info',
        message: `Welcome ${user.name ?? user.id} to the battle!`,
      }
      connection.send(JSON.stringify(welcomeMessage))

      const broadcastMessage: InfoMessage = {
        type: 'info',
        message: `${user.name ?? user.id} has joined the battle`,
      }
      this.broadcast(JSON.stringify(broadcastMessage), [connection.id])

      // Send initial state
      this.sendStateToConnection(connection)
    }
  }

  async onMessage(connection: Connection<ConnectionState>, message: WSMessage): Promise<void> {
    const text = toText(message)

    try {
      const parsed: unknown = JSON.parse(text)

      if (!isClientMessage(parsed)) {
        return
      }

      const player = this.getPlayerByConnection(connection)

      // Handle all client messages with exhaustive switch
      switch (parsed.type) {
        case 'chat': {
          this.messageHistory.push(parsed.message)
          const broadcastMessage: ChatMessage = {
            type: 'chat',
            from: player?.state.user.name ?? connection.id,
            message: parsed.message,
          }
          this.broadcast(JSON.stringify(broadcastMessage), [connection.id])
          break
        }

        case 'deploy':
        case 'fire':
          await this.handleBattleshipMessage(connection, parsed)
          break

        default: {
          const _exhaustive: never = parsed
          console.warn('Unhandled client message type:', _exhaustive)
        }
      }
    } catch (_err: unknown) {
      // Invalid JSON - ignore
      return
    }
  }

  private getPlayerByConnection(
    connection: Connection<ConnectionState>,
  ): { role: 'player1' | 'player2'; state: PlayerState } | null {
    const connectionRole = connection.state?.role
    if (!connectionRole) return null

    const playerState = this.game.players[connectionRole]
    if (playerState) {
      return { role: connectionRole, state: playerState }
    }
    return null
  }

  private async handleBattleshipMessage(
    connection: Connection<ConnectionState>,
    msg: BattleshipClientMessage,
  ): Promise<void> {
    const player = this.getPlayerByConnection(connection)
    if (!player) return

    const { role: playerRole, state: playerState } = player

    if (msg.type === 'deploy') {
      const validation = validateFleetPlacement(msg.fleet)
      if (!validation.ok) {
        const errorMsg: BattleshipServerMessage = {
          type: 'error',
          message: `Invalid fleet: ${validation.message}`,
        }
        connection.send(JSON.stringify(errorMsg))
        return
      }

      // Store the fleet
      playerState.fleet = toInitialFleetState(msg.fleet)

      // Broadcast that this player is ready
      const readyMsg: InfoMessage = {
        type: 'info',
        message: `${playerState.user.name ?? playerState.user.id} has deployed their fleet`,
      }
      this.broadcast(JSON.stringify(readyMsg))

      // Check if both players are ready
      const bothReady = Object.values(this.game.players).every((p) => p?.fleet !== undefined)
      if (bothReady) {
        // Randomly determine who goes first
        this.game.turn = Math.random() < 0.5 ? 'player1' : 'player2'

        // Notify both players that the game has started
        this.game.phase = 'playing'

        const startPlayer = this.game.players[this.game.turn]
        const startMsg: InfoMessage = {
          type: 'info',
          message: `Battle begins! ${startPlayer?.user.name ?? startPlayer?.user.id} goes first`,
        }
        this.broadcast(JSON.stringify(startMsg))

        this.broadcastState()
      }
    } else if (msg.type === 'fire') {
      // Validate game state
      if (this.game.phase !== 'playing') {
        const errorMsg: BattleshipServerMessage = {
          type: 'error',
          message: 'Game is not in playing phase',
        }
        connection.send(JSON.stringify(errorMsg))
        return
      }

      // Check if it's this player's turn
      if (playerRole !== this.game.turn) {
        const errorMsg: BattleshipServerMessage = {
          type: 'error',
          message: "It's not your turn",
        }
        connection.send(JSON.stringify(errorMsg))
        return
      }

      // Validate coordinate
      if (!isWithinBoard(msg.at)) {
        const errorMsg: BattleshipServerMessage = {
          type: 'error',
          message: 'Invalid coordinate',
        }
        connection.send(JSON.stringify(errorMsg))
        return
      }

      // Check if already fired at this coordinate
      const alreadyFired = playerState.shotsFired?.some((c) => c.x === msg.at.x && c.y === msg.at.y)
      if (alreadyFired) {
        const errorMsg: BattleshipServerMessage = {
          type: 'error',
          message: 'Already fired at this coordinate',
        }
        connection.send(JSON.stringify(errorMsg))
        return
      }

      // Get opponent
      const opponentRole = playerRole === 'player1' ? 'player2' : 'player1'
      const opponent = this.game.players[opponentRole]

      if (!opponent?.fleet) {
        const errorMsg: BattleshipServerMessage = {
          type: 'error',
          message: 'Opponent fleet not found',
        }
        connection.send(JSON.stringify(errorMsg))
        return
      }

      // Record the shot
      if (!playerState.shotsFired) {
        playerState.shotsFired = []
      }
      playerState.shotsFired.push(msg.at)

      // Apply shot to opponent's fleet
      const { fleet: updatedFleet, result } = applyShotToFleet(opponent.fleet, msg.at)
      opponent.fleet = updatedFleet

      // Check if game is over
      const isGameOver = isFleetSunk(opponent.fleet)

      // Switch turn
      this.game.turn = opponentRole

      // Send result to both players (includes new turn and game over flag)
      const resultMsg: BattleshipServerMessage = {
        type: 'fireResult',
        at: msg.at,
        result,
        turn: opponentRole,
        isGameOver,
      }
      this.broadcast(JSON.stringify(resultMsg))

      if (isGameOver) {
        this.game.winner = playerRole
        this.game.phase = 'finished'

        const db = getDB(this.env)
        await db
          .update(game)
          .set({
            status: 'finished',
            winnerId: playerState.user.id,
            updatedAt: new Date(),
          })
          .where(eq(game.id, this.name))

        const winMsg: InfoMessage = {
          type: 'info',
          message: `${playerState.user.name ?? playerState.user.id} wins! All enemy ships destroyed!`,
        }
        this.broadcast(JSON.stringify(winMsg))
        this.broadcastState()
      }
    }
  }

  onClose(connection: Connection<ConnectionState>): void {
    const player = this.getPlayerByConnection(connection)

    if (player) {
      const broadcastMessage: InfoMessage = {
        type: 'info',
        message: `${player.state.user.name ?? player.state.user.id} has left the battle`,
      }
      this.broadcast(JSON.stringify(broadcastMessage))
    }
  }
}
