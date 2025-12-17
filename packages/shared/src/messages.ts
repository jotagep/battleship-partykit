// Message types for WebSocket communication between client and server

import {
  type Coordinate,
  type FleetPlacement,
  type GamePhase,
  isCoordinate,
  type ShotResult,
} from './battleship'

export const RoomCloseCode: Record<string, number> = {
  NORMAL: 1000,
  INVALID_ACTION: 4000,
  UNAUTHORIZED: 4001,
  ROOM_FULL: 4002,
  ROOM_NOT_FOUND: 4003,
} as const

// --- Game messages (client <-> server) ---

/**
 * Battleship game messages sent from client to server
 */
export type BattleshipClientMessage =
  | { type: 'chat'; message: string }
  | { type: 'deploy'; fleet: FleetPlacement }
  | { type: 'fire'; at: Coordinate }
  | { type: 'surrender' }

export interface ShotRecord {
  x: number
  y: number
  result: ShotResult
}

/**
 * Game state and result messages sent from server to client
 */
export type BattleshipServerMessage =
  | { type: 'info'; message: string }
  | { type: 'chat'; from: string; message: string }
  | {
      type: 'state'
      you: 'player1' | 'player2'
      phase: GamePhase
      turn?: 'player1' | 'player2'
      winner?: 'player1' | 'player2'
      fleet?: FleetPlacement
      myShots?: ShotRecord[]
      opponentShots?: ShotRecord[]
      players?: {
        player1: { name: string }
        player2: { name: string }
      }
    }
  | {
      type: 'fireResult'
      at: Coordinate
      result: ShotResult
      turn: 'player1' | 'player2'
      isGameOver?: boolean
    }
  | { type: 'error'; message: string }
  | { type: 'surrender'; winner: 'player1' | 'player2'; message?: string }

/**
 * Type guard to check if a value is a valid BattleshipServerMessage
 */
export function isServerMessage(value: unknown): value is BattleshipServerMessage {
  if (typeof value !== 'object' || value === null || !('type' in value)) return false
  const record = value as Record<string, unknown>
  const t = record.type

  if (
    t === 'info' ||
    t === 'chat' ||
    t === 'state' ||
    t === 'fireResult' ||
    t === 'error' ||
    t === 'surrender'
  )
    return true

  return false
}

/**
 * Type guard to check if a value is a valid BattleshipClientMessage
 */
export function isClientMessage(value: unknown): value is BattleshipClientMessage {
  if (typeof value !== 'object' || value === null || !('type' in value)) return false
  const record = value as Record<string, unknown>
  const t = record.type

  if (t === 'chat') {
    return 'message' in record && typeof record.message === 'string'
  }
  if (t === 'deploy') {
    return 'fleet' in record && Array.isArray(record.fleet)
  }
  if (t === 'fire') {
    return 'at' in record && isCoordinate(record.at)
  }
  if (t === 'surrender') {
    return true
  }

  return false
}
