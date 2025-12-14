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

/**
 * Welcome message sent from server when a client connects
 */
export interface InfoMessage {
  type: 'info'
  message: string
}

/**
 * Broadcast message sent from server to all clients
 */
export interface ChatMessage {
  type: 'chat'
  from: string
  message: string
}

/**
 * Type guard to check if a message is an InfoMessage
 */
export function isInfoMessage(message: unknown): message is InfoMessage {
  return (
    typeof message === 'object' && message !== null && 'type' in message && message.type === 'info'
  )
}

/**
 * Type guard to check if a message is a  ChatMessage
 */
export function isChatMessage(message: unknown): message is ChatMessage {
  return (
    typeof message === 'object' &&
    message !== null &&
    'type' in message &&
    message.type === 'chat' &&
    'from' in message
  )
}

// --- Game messages (client <-> server) ---

/**
 * Chat message sent from client to server
 */
export interface ChatClientMessage {
  type: 'chat'
  message: string
}

/**
 * Battleship game messages sent from client to server
 */
export type BattleshipClientMessage =
  | { type: 'deploy'; fleet: FleetPlacement }
  | { type: 'fire'; at: Coordinate }

export interface ShotRecord {
  x: number
  y: number
  result: ShotResult
}

/**
 * Game state and result messages sent from server to client
 */
export type BattleshipServerMessage =
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

/**
 * All messages that can be sent from client to server
 */
export type ClientMessage = ChatClientMessage | BattleshipClientMessage

/**
 * All messages that can be sent from server to client
 */
export type ServerMessage = InfoMessage | ChatMessage | BattleshipServerMessage

/**
 * Type guard to check if a value is a valid ServerMessage
 */
export function isServerMessage(value: unknown): value is ServerMessage {
  if (typeof value !== 'object' || value === null || !('type' in value)) return false
  const record = value as Record<string, unknown>
  const t = record.type

  // Info/Chat messages
  if (t === 'info' || t === 'chat') return true

  // Battleship game messages
  if (t === 'state' || t === 'fireResult' || t === 'error') return true

  return false
}

/**
 * Type guard to check if a value is a valid ClientMessage
 */
export function isClientMessage(value: unknown): value is ClientMessage {
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
  return false
}
