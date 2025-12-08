'use client'

import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { usePartySocket } from 'partysocket/react'

import { authClient } from '@/lib/auth'

type LogEntry = {
  id: string
  text: string
  kind: 'system' | 'local' | 'remote'
}

function formatMessage(data: MessageEvent['data']): string {
  if (typeof data === 'string') return data
  if (data instanceof ArrayBuffer) return new TextDecoder().decode(data)
  return new TextDecoder().decode(data.buffer)
}

interface GameRoomProps {
  roomId: string
  onLeave: () => void
}

export function GameRoom({ roomId, onLeave }: GameRoomProps) {
  const [host] = useState('localhost:8787')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('connecting')
  const [log, setLog] = useState<LogEntry[]>([])
  const { data: session } = authClient.useSession()

  const endpoint = useMemo(
    () => `${host.replace(/^https?:\/\//, '')}/parties/battleship-party/${roomId}`,
    [host, roomId],
  )

  const socket = usePartySocket({
    host,
    party: 'battleship-party',
    room: roomId,
    onOpen() {
      setStatus('connected')
      setLog((prev) => [...prev, { id: crypto.randomUUID(), kind: 'system', text: 'Connected' }])
    },
    onClose(evt) {
      setStatus('closed')
      setLog((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          kind: 'system',
          text: `Closed (${evt.code})`,
        },
      ])
    },
    onError() {
      setStatus('error')
      setLog((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          kind: 'system',
          text: 'Socket error',
        },
      ])
    },
    onMessage(evt) {
      let text = formatMessage(evt.data)
      try {
        const parsed = JSON.parse(text)
        if (parsed?.message) {
          text = parsed.message
        } else if (parsed?.type) {
          text = JSON.stringify(parsed)
        }
      } catch (_err: unknown) {
        console.error('Error parsing message', _err)
      }
      setLog((prev) => [...prev, { id: crypto.randomUUID(), kind: 'remote', text }])
    },
  })

  useEffect(() => {
    setStatus('connecting')
    setLog([
      {
        id: crypto.randomUUID(),
        kind: 'system',
        text: `Connecting to ${endpoint}`,
      },
    ])
  }, [endpoint])

  const canSend = socket?.readyState === WebSocket.OPEN && !!session

  const sendMessage = (e: FormEvent) => {
    e.preventDefault()
    const text = message.trim()
    if (!text || !socket) return
    socket.send(text)
    setLog((prev) => [...prev, { id: crypto.randomUUID(), kind: 'local', text }])
    setMessage('')
  }

  return (
    <div className="w-full max-w-3xl z-10">
      <div className="backdrop-blur-xl bg-slate-900/60 border border-slate-700/50 rounded-xl shadow-[0_0_50px_-12px_rgba(34,211,238,0.15)] overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-700/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40">
          <div>
            <p className="text-xs font-spacemono text-neon-cyan/70 uppercase tracking-widest mb-1">
              Mission: {roomId}
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

        <div className="p-6 md:p-8 space-y-8">
          {/* Command Interface */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-orbitron text-slate-300 tracking-wider">Command Log</h3>
              <div className="h-px flex-1 bg-slate-800 ml-4"></div>
            </div>

            <div
              className="rounded-lg border border-slate-800 bg-black/60 p-4 h-64 overflow-y-auto font-spacemono text-xs space-y-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
              aria-live="polite"
            >
              {log.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex gap-3 ${
                    entry.kind === 'system'
                      ? 'text-slate-500'
                      : entry.kind === 'local'
                        ? 'text-neon-cyan'
                        : 'text-neon-lime'
                  }`}
                >
                  <span className="opacity-50 select-none">
                    {entry.kind === 'system' ? '>' : entry.kind === 'local' ? '>>' : '<<'}
                  </span>
                  <span>{entry.text}</span>
                </div>
              ))}
              {log.length === 0 && (
                <div className="text-slate-600 italic">Waiting for transmission...</div>
              )}
            </div>

            <form className="flex gap-3" onSubmit={sendMessage}>
              <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter command..."
                disabled={!canSend}
                className="flex-1 px-4 py-3 rounded bg-slate-950/50 border border-slate-800 text-white font-spacemono text-sm placeholder-slate-600 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={!canSend || !message.trim()}
                className="px-8 py-3 rounded bg-neon-cyan hover:bg-cyan-400 text-void font-orbitron font-bold text-sm tracking-wider transition-all hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                SEND
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
