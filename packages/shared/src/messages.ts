// Message types for WebSocket communication between client and server

/**
 * Message type constants
 */
export const MessageType = {
  WELCOME: 'welcome',
  BROADCAST: 'broadcast',
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
export interface WelcomeMessage extends BaseMessage {
  type: typeof MessageType.WELCOME
}

/**
 * Broadcast message sent from server to all clients
 */
export interface BroadcastMessage extends BaseMessage {
  type: typeof MessageType.BROADCAST
  from: string
}

/**
 * All possible server-to-client messages
 */
export type ServerMessage = WelcomeMessage | BroadcastMessage

/**
 * Type guard to check if a message is a WelcomeMessage
 */
export function isWelcomeMessage(message: unknown): message is WelcomeMessage {
  return (
    typeof message === 'object' &&
    message !== null &&
    'type' in message &&
    message.type === MessageType.WELCOME &&
    'id' in message
  )
}

/**
 * Type guard to check if a message is a BroadcastMessage
 */
export function isBroadcastMessage(message: unknown): message is BroadcastMessage {
  return (
    typeof message === 'object' &&
    message !== null &&
    'type' in message &&
    message.type === MessageType.BROADCAST &&
    'from' in message
  )
}
