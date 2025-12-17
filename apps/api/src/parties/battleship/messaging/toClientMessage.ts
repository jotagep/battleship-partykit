import {
  applyShotToFleet,
  type Coordinate,
  type FleetPlacement,
  type FleetState,
  type GameRolePlayer,
  type ShotResult,
} from '@repo/shared/battleship'
import { type BattleshipServerMessage, type ShotRecord } from '@repo/shared/messages'

import { type GameState } from '../domain/GameState'

function fleetStateToPlacement(fleet?: FleetState): FleetPlacement | undefined {
  if (!fleet) return undefined
  return fleet.map(({ hits: _hits, ...placement }) => placement)
}

function getShotsWithResults(
  shots: Coordinate[] | undefined,
  targetFleet: FleetState | undefined,
): ShotRecord[] {
  if (!shots || !targetFleet) return []

  return shots.map((shot) => {
    const { result } = applyShotToFleet(targetFleet, shot)
    return { x: shot.x, y: shot.y, result }
  })
}

export function createStateMessage(
  game: GameState,
  playerRole: GameRolePlayer,
): BattleshipServerMessage {
  const player = game.players[playerRole]
  const opponentRole = playerRole === 'player1' ? 'player2' : 'player1'
  const opponent = game.players[opponentRole]

  const myShots = getShotsWithResults(player?.shotsFired, opponent?.fleet)
  const opponentShots = getShotsWithResults(opponent?.shotsFired, player?.fleet)

  const player1 = game.players.player1?.user
  const player2 = game.players.player2?.user

  return {
    type: 'state',
    you: playerRole,
    phase: game.phase,
    turn: game.turn,
    winner: game.winner,
    fleet: fleetStateToPlacement(player?.fleet),
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
}

export function createInfoMessage(message: string): BattleshipServerMessage {
  return {
    type: 'info',
    message,
  }
}

export function createErrorMessage(message: string): BattleshipServerMessage {
  return {
    type: 'error',
    message,
  }
}

export function createChatMessage(from: string, message: string): BattleshipServerMessage {
  return {
    type: 'chat',
    from,
    message,
  }
}

export function createSurrenderMessage(
  winner: 'player1' | 'player2',
  message: string,
): BattleshipServerMessage {
  return {
    type: 'surrender',
    winner,
    message,
  }
}

export function createFireResultMessage(
  at: Coordinate,
  result: ShotResult,
  turn: GameRolePlayer,
  isGameOver: boolean,
): BattleshipServerMessage {
  return {
    type: 'fireResult',
    at,
    result,
    turn,
    isGameOver,
  }
}
