'use client'

import { isServerMessage } from '@repo/shared/messages'
import { toast } from 'sonner'

import { useGameRoomStore } from '@/lib/stores/game-room-store'

function formatMessage(data: MessageEvent['data']): string {
  if (typeof data === 'string') return data
  if (data instanceof ArrayBuffer) return new TextDecoder().decode(data)
  return new TextDecoder().decode((data as ArrayBufferView).buffer)
}

export function handleGameRoomMessage(evt: MessageEvent) {
  const text = formatMessage(evt.data)
  const { setGamePhase, addLog, addChatMessage, setDeployedFleet } = useGameRoomStore.getState()

  try {
    const parsed: unknown = JSON.parse(text)

    if (!isServerMessage(parsed)) {
      addLog(`Received unknown message: ${text}`, 'system')
      return
    }

    // Handle all server messages with exhaustive switch
    switch (parsed.type) {
      case 'state':
        setGamePhase(parsed.phase)
        if (parsed.fleet) {
          setDeployedFleet(parsed.fleet)
        }
        if (parsed.phase === 'playing') {
          addLog('Game started!', 'system')
        }
        break

      case 'fireResult':
        addLog(`Shot at (${parsed.at.x}, ${parsed.at.y}): ${parsed.result.outcome}`, 'game')
        break

      case 'error':
        toast.error(parsed.message)
        addLog(`Error: ${parsed.message}`, 'system')
        break

      case 'info':
        addLog(parsed.message || '', 'system')
        break

      case 'chat':
        addChatMessage(parsed.message || '', parsed.from, false)
        break

      default: {
        // Exhaustiveness check: if a new message type is added, TypeScript will error here
        const _exhaustive: never = parsed
        console.warn('Unhandled message type:', _exhaustive)
      }
    }
  } catch (_err) {
    // Fallback for non-JSON messages
    addLog(`Received raw: ${text}`, 'system')
  }
}
