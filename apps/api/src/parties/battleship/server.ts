import { RoomCloseCode } from '@repo/shared/messages'
import { type Connection, type ConnectionContext, Server, type WSMessage } from 'partyserver'

import { type BindingsEnv } from '../../types/env'

import { BattleshipService } from './application/BattleshipService'
import { resolvePlayer } from './auth/resolvePlayer'
import { type ConnectionState } from './domain/ConnectionState'
import { GameError } from './domain/errors'
import {
  createChatMessage,
  createErrorMessage,
  createFireResultMessage,
  createInfoMessage,
  createStateMessage,
  createSurrenderMessage,
} from './messaging/toClientMessage'
import { parseMessage } from './messaging/toServerMessage'
import { GameRepository } from './persistence/GameRepository'
import { GameStateStore } from './persistence/GameStateStore'

export class Battleship extends Server<BindingsEnv> {
  messageHistory: string[] = []
  service!: BattleshipService

  async onStart(): Promise<void> {
    const store = new GameStateStore(this.ctx.storage.kv)
    const repo = new GameRepository(this.env)
    this.service = new BattleshipService(this.name, store, repo)
    await this.service.load()
  }

  private sendStateToConnection(connection: Connection<ConnectionState>): void {
    const role = connection.state?.role
    if (!role) return

    const stateMessage = createStateMessage(this.service.game, role)
    connection.send(JSON.stringify(stateMessage))
  }

  private broadcastState(): void {
    for (const conn of this.getConnections<ConnectionState>()) {
      this.sendStateToConnection(conn)
    }
  }

  async onConnect(connection: Connection<ConnectionState>, ctx: ConnectionContext): Promise<void> {
    try {
      const { user, role } = await resolvePlayer(this.env, ctx.request, this.name)

      connection.setState({ user, role })

      const existingPlayer = this.service.game.players[role]

      await this.service.addPlayer(role, user)

      if (existingPlayer) {
        const reconnectMessage = createInfoMessage(
          `${user.name ?? user.id} has reconnected to the battle`,
        )
        this.broadcast(JSON.stringify(reconnectMessage), [connection.id])
      } else {
        const welcomeMessage = createInfoMessage(`Welcome ${user.name ?? user.id} to the battle!`)
        connection.send(JSON.stringify(welcomeMessage))

        const broadcastMessage = createInfoMessage(`${user.name ?? user.id} has joined the battle`)
        this.broadcast(JSON.stringify(broadcastMessage), [connection.id])
      }

      this.sendStateToConnection(connection)
    } catch (error) {
      if (error instanceof GameError && error.code) {
        connection.close(error.code, error.message)
      } else {
        connection.close(RoomCloseCode.UNEXPECTED_ERROR, 'Unexpected error')
      }
    }
  }

  async onMessage(connection: Connection<ConnectionState>, message: WSMessage): Promise<void> {
    const parsed = parseMessage(message)

    if (parsed.type === 'unknown') return

    const role = connection.state?.role
    const user = connection.state?.user
    if (!role || !user) return

    switch (parsed.type) {
      case 'chat': {
        this.messageHistory.push(parsed.message)
        const broadcastMessage = createChatMessage(user.name ?? connection.id, parsed.message)
        this.broadcast(JSON.stringify(broadcastMessage), [connection.id])
        break
      }

      case 'surrender': {
        const result = await this.service.surrender(role)
        if (!result.ok) {
          connection.send(JSON.stringify(createErrorMessage(result.error)))
          return
        }

        const opponentRole = result.winner === 'player1' ? 'player2' : 'player1'
        const opponent = this.service.game.players[opponentRole]

        const surrenderMsg = createSurrenderMessage(
          result.winner,
          `${user.name ?? user.id} has surrendered! ${
            opponent?.user.name ?? opponent?.user.id
          } wins!`,
        )
        this.broadcast(JSON.stringify(surrenderMsg))
        break
      }

      case 'deploy': {
        const result = await this.service.deploy(role, parsed.fleet)
        if (!result.ok) {
          connection.send(JSON.stringify(createErrorMessage(result.error)))
          return
        }

        const readyMsg = createInfoMessage(`${user.name ?? user.id} has deployed their fleet`)
        this.broadcast(JSON.stringify(readyMsg))

        if (result.gameStarted) {
          const startPlayer = this.service.game.players[this.service.game.turn]
          const startMsg = createInfoMessage(
            `Battle begins! ${startPlayer?.user.name ?? startPlayer?.user.id} goes first`,
          )
          this.broadcast(JSON.stringify(startMsg))
          this.broadcastState()
        }
        break
      }

      case 'fire': {
        const result = await this.service.fire(role, parsed.at)
        if (!result.ok) {
          connection.send(JSON.stringify(createErrorMessage(result.error)))
          return
        }

        const resultMsg = createFireResultMessage(
          parsed.at,
          result.result,
          result.nextTurn,
          result.isGameOver,
        )
        this.broadcast(JSON.stringify(resultMsg))

        if (result.isGameOver) {
          const winMsg = createInfoMessage(
            `${user.name ?? user.id} wins! All enemy ships destroyed!`,
          )
          this.broadcast(JSON.stringify(winMsg))
          this.broadcastState()
        }
        break
      }
    }
  }

  async onClose(connection: Connection<ConnectionState>): Promise<void> {
    const role = connection.state?.role
    const user = connection.state?.user

    if (role && user) {
      await this.service.removePlayer(role)

      const broadcastMessage = createInfoMessage(`${user.name ?? user.id} has left the battle`)
      this.broadcast(JSON.stringify(broadcastMessage))
    }
  }
}
