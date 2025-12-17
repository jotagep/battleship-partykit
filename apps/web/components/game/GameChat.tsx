'use client'

import { type FormEvent, useState } from 'react'
import { BattleshipClientMessage } from '@repo/shared/messages'
import { usePartySocket } from 'partysocket/react'

import { authClient } from '@/lib/auth'
import { useGameRoomStore } from '@/lib/stores/gameStore'

interface GameChatProps {
  socket: ReturnType<typeof usePartySocket>
}

export function GameChat({ socket }: GameChatProps) {
  const { data: session } = authClient.useSession()
  const { messages, addChatMessage } = useGameRoomStore()
  const [message, setMessage] = useState('')

  const canSend = socket?.readyState === socket.OPEN && !!session

  const sendMessage = (e: FormEvent) => {
    e.preventDefault()
    const text = message.trim()
    if (!text || !socket) return
    const chatMsg: BattleshipClientMessage = { type: 'chat', message: text }
    socket.send(JSON.stringify(chatMsg))
    addChatMessage(text, session?.user.name || 'Me', true)
    setMessage('')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-orbitron text-slate-300 tracking-wider">Command Log</h3>
        <div className="h-px flex-1 bg-slate-800 ml-4"></div>
      </div>

      <div
        className="rounded-lg border border-slate-800 bg-black/60 p-4 h-64 overflow-y-auto font-spacemono text-xs space-y-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
        aria-live="polite"
      >
        {messages.map((entry) => {
          if (entry.type === 'log') {
            return (
              <div key={entry.id} className="flex gap-3 text-slate-500">
                <span className="opacity-50 select-none">&gt;</span>
                <span>{entry.text}</span>
              </div>
            )
          }

          return (
            <div
              key={entry.id}
              className={`flex gap-3 ${entry.isLocal ? 'text-neon-cyan' : 'text-neon-lime'}`}
            >
              <span className="opacity-50 select-none">{entry.isLocal ? '>>' : '<<'}</span>
              <span>
                <b>{entry.from}: </b>
                {entry.text}
              </span>
            </div>
          )
        })}
        {messages.length === 0 && (
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
  )
}
