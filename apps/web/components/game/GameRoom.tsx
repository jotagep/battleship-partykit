'use client'

import { useEffect, useState } from 'react'
import { type FleetPlacement } from '@repo/shared/battleship'
import { type GameActive } from '@repo/shared/games'
import { isChatMessage, isInfoMessage, RoomCloseCode } from '@repo/shared/messages'
import { ChevronDown, MessageSquare, X } from 'lucide-react'
import { usePartySocket } from 'partysocket/react'
import { toast } from 'sonner'

import { type LogEntry, useGameRoomStore } from '@/lib/stores/game-room-store'

import { GameChat } from './GameChat'
import { GameChatNotificationDot } from './GameChatNotificationDot'
import { GamePreparationPhase } from './GamePreparationPhase'

function formatMessage(data: MessageEvent['data']): string {
  if (typeof data === 'string') return data
  if (data instanceof ArrayBuffer) return new TextDecoder().decode(data)
  return new TextDecoder().decode(data.buffer)
}

interface GameRoomProps {
  game: GameActive
  onLeave: () => void
}

export function GameRoom({ game, onLeave }: GameRoomProps) {
  const { host, status, setStatus, appendLog, resetLog } = useGameRoomStore()
  const [isChatOpen, setIsChatOpen] = useState(false)

  const socket = usePartySocket({
    host,
    party: 'battleship-party',
    room: game.id,
    onOpen() {
      setStatus('connected')
      appendLog({ kind: 'system', text: 'Connected' })
    },
    onClose(evt) {
      setStatus('closed')
      switch (evt.code) {
        case RoomCloseCode.NORMAL:
          break
        case RoomCloseCode.UNAUTHORIZED:
          toast.error('Unauthorized')
          break
        case RoomCloseCode.ROOM_NOT_FOUND:
          toast.error('Game not found')
          break

        default:
          break
      }

      onLeave()
    },
    onError() {
      setStatus('error')
      appendLog({ kind: 'system', text: 'Socket error' })
    },
    onMessage(evt) {
      let text = formatMessage(evt.data)
      let kind: LogEntry['kind'] = 'remote'
      let from: string | undefined = undefined

      try {
        const parsed: unknown = JSON.parse(text)

        if (isInfoMessage(parsed)) {
          kind = 'system'
          text = `${parsed.message}`
        } else if (isChatMessage(parsed)) {
          kind = 'remote'
          from = parsed.from
          text = `${parsed.message}`
        } else if (typeof parsed === 'object' && parsed !== null && 'type' in parsed) {
          text = JSON.stringify(parsed)
        }
      } catch (_err: unknown) {
        console.error('Error parsing message', _err)
      }
      appendLog({ kind, text, from })
    },
  })

  useEffect(() => {
    resetLog()
  }, [resetLog])

  const handleDeploy = (fleet: FleetPlacement) => {
    console.log('Deploying fleet', fleet)
    toast.success('Fleet deployed! Waiting for opponent...')
    // socket.send(JSON.stringify({ type: 'deploy', ships }))
  }

  return (
    <div className="w-full max-w-6xl z-10 relative">
      <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 rounded-xl shadow-[0_0_50px_-12px_rgba(34,211,238,0.15)] overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-700/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40">
          <div>
            <p className="text-xs font-spacemono text-neon-cyan/70 uppercase tracking-widest mb-1">
              <b>Mission:</b> {game.name}
            </p>
            <h1 className="text-3xl md:text-4xl font-orbitron font-bold tracking-wider bg-linear-to-r from-white to-slate-400 bg-clip-text text-transparent">
              BATTLESHIP<span className="text-neon-cyan">.CMD</span>
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-slate-950/50 border border-slate-800">
              <div className="relative flex h-3 w-3">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    status === 'connected'
                      ? 'bg-neon-lime'
                      : status === 'error'
                        ? 'bg-neon-red'
                        : 'bg-amber-400'
                  }`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-3 w-3 ${
                    status === 'connected'
                      ? 'bg-neon-lime'
                      : status === 'error'
                        ? 'bg-neon-red'
                        : 'bg-amber-400'
                  }`}
                ></span>
              </div>
              <span className="text-sm font-spacemono uppercase text-slate-300">{status}</span>
            </div>
            <button
              onClick={onLeave}
              className="px-4 py-2 bg-red-500/10 border border-red-500/50 text-red-400 font-orbitron text-xs tracking-wider hover:bg-red-500/20 transition-colors uppercase"
            >
              Abort
            </button>
          </div>
        </div>

        <div className="p-6 md:p-8">
          <GamePreparationPhase onDeploy={handleDeploy} />
        </div>
      </div>

      {/* Floating Chat */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
        {isChatOpen && (
          <div className="w-80 md:w-96 bg-slate-950/90 border border-slate-700 rounded-xl shadow-2xl backdrop-blur-xl p-4 animate-in slide-in-from-bottom-10 fade-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-orbitron text-neon-cyan tracking-widest">
                SECURE CHANNEL
              </h3>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <GameChat socket={socket} />
          </div>
        )}

        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`relative h-14 w-14 rounded-full flex items-center justify-center transition-all shadow-lg hover:scale-105 active:scale-95 ${
            isChatOpen
              ? 'bg-slate-800 text-slate-400 border border-slate-700'
              : 'bg-neon-cyan/10 border border-neon-cyan/50 text-neon-cyan hover:bg-neon-cyan/20 shadow-[0_0_20px_rgba(34,211,238,0.3)]'
          }`}
        >
          <GameChatNotificationDot isOpenChat={isChatOpen} />
          {isChatOpen ? <ChevronDown className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        </button>
      </div>
    </div>
  )
}
