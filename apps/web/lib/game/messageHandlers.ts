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
  const {
    gamePhase,
    setGamePhase,
    addLog,
    addChatMessage,
    setDeployedFleet,
    setTurn,
    setWinner,
    setMyRole,
    setMyShots,
    setOpponentShots,
    setPlayers,
    turn,
    myRole,
    addMyShot,
    addOpponentShot,
  } = useGameRoomStore.getState()

  try {
    const parsed: unknown = JSON.parse(text)

    if (!isServerMessage(parsed)) {
      addLog(`Received unknown message: ${text}`, 'system')
      return
    }

    // Handle all server messages with exhaustive switch
    switch (parsed.type) {
      case 'state':
        if (gamePhase !== 'playing' && parsed.phase === 'playing') {
          addLog('Game started!', 'system')
        }
        setGamePhase(parsed.phase)
        setMyRole(parsed.you)
        if (parsed.turn) {
          setTurn(parsed.turn)
        }
        if (parsed.winner) {
          setWinner(parsed.winner)
        }
        if (parsed.fleet) {
          setDeployedFleet(parsed.fleet)
        }
        if (parsed.myShots) {
          setMyShots(parsed.myShots)
        }
        if (parsed.opponentShots) {
          setOpponentShots(parsed.opponentShots)
        }
        if (parsed.players) {
          setPlayers(parsed.players)
        }
        break

      case 'fireResult': {
        const isMyShot = turn === myRole
        const shotRecord = { x: parsed.at.x, y: parsed.at.y, result: parsed.result }

        if (isMyShot) {
          addMyShot(shotRecord)
          addLog(`You fired at (${parsed.at.x}, ${parsed.at.y}): ${parsed.result.outcome}`, 'game')
          if (parsed.result.outcome === 'sunk') {
            toast.success('Enemy ship destroyed!', {
              description: 'Target eliminated successfully.',
            })
          } else if (parsed.result.outcome === 'hit') {
            toast.success('Target hit!', {
              description: 'Direct hit confirmed.',
            })
          } else {
            toast.info('Shot missed', {
              description: 'No impact confirmed.',
            })
          }
        } else {
          addOpponentShot(shotRecord)
          addLog(
            `Opponent fired at (${parsed.at.x}, ${parsed.at.y}): ${parsed.result.outcome}`,
            'game',
          )
          if (parsed.result.outcome === 'sunk') {
            toast.error('Your ship has been destroyed!', {
              description: 'Hull integrity critical.',
            })
          } else if (parsed.result.outcome === 'hit') {
            toast.error('We have been hit!', {
              description: 'Taking damage!',
            })
          } else {
            toast.info('Opponent missed', {
              description: 'Evasive maneuvers successful.',
            })
          }
        }

        // Update turn
        setTurn(parsed.turn)

        // Handle game over
        if (parsed.isGameOver) {
          const winner = isMyShot ? myRole : myRole === 'player1' ? 'player2' : 'player1'
          setWinner(winner)
          setGamePhase('finished')
        }
        break
      }

      case 'surrender':
        setGamePhase('finished')
        setWinner(parsed.winner)
        if (parsed.message) {
          toast.info(parsed.message)
          addLog(parsed.message, 'system')
        }
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
