import { type BattleshipClientMessage, isClientMessage } from '@repo/shared/messages'
import { type WSMessage } from 'partyserver'

const decoder = new TextDecoder()

function toText(message: WSMessage): string {
  if (typeof message === 'string') return message
  if (message instanceof ArrayBuffer) return decoder.decode(message)
  return decoder.decode(message.buffer)
}

export function parseMessage(message: WSMessage): BattleshipClientMessage | { type: 'unknown' } {
  const text = toText(message)
  try {
    const parsed: unknown = JSON.parse(text)
    if (isClientMessage(parsed)) {
      return parsed
    }
  } catch {
    // ignore
  }
  return { type: 'unknown' }
}
