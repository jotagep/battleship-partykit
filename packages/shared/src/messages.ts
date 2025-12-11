// Message types for WebSocket communication between client and server

export const RoomCloseCode: Record<string, number> = {
  NORMAL: 1000,
  INVALID_ACTION: 4000,
  UNAUTHORIZED: 4001,
  ROOM_FULL: 4002,
  ROOM_NOT_FOUND: 4003,
} as const

/**
 * Message type constants
 */
export const MessageType = {
  INFO: 'info',
  CHAT: 'chat',
} as const

/**
 * Message type enum for type-safe message handling
 */
export type MessageTypeEnum = (typeof MessageType)[keyof typeof MessageType]

/**
 * Base message structure
 */
export interface BaseMessage {
  type: MessageTypeEnum
  room: string
  message?: string
}

/**
 * Welcome message sent from server when a client connects
 */
export interface InfoMessage extends BaseMessage {
  type: typeof MessageType.INFO
}

/**
 * Broadcast message sent from server to all clients
 */
export interface ChatMessage extends BaseMessage {
  type: typeof MessageType.CHAT
  from: string
}

/**
 * All possible server-to-client messages
 */
export type ServerMessage = InfoMessage | ChatMessage

/**
 * Type guard to check if a message is an InfoMessage
 */
export function isInfoMessage(message: unknown): message is InfoMessage {
  return (
    typeof message === 'object' &&
    message !== null &&
    'type' in message &&
    message.type === MessageType.INFO
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
    message.type === MessageType.CHAT &&
    'from' in message
  )
}
