'use client'

import { useState } from 'react'

import { GameRoom } from '@/components/game-room'
import { LandingPage } from '@/components/landing-page'
import { Lobby } from '@/components/lobby'

import { authClient } from '@/lib/auth'

export default function Home() {
  const { data: session, isPending: sessionLoading } = authClient.useSession()
  const [currentRoom, setCurrentRoom] = useState<string | null>(null)

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-cyan-500 font-spacemono">
        INITIALIZING SYSTEM...
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 font-rajdhani bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-slate-900 via-void to-void">
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      {!session ? (
        <LandingPage />
      ) : currentRoom ? (
        <GameRoom roomId={currentRoom} onLeave={() => setCurrentRoom(null)} />
      ) : (
        <Lobby
          onJoinRoom={(roomId) => setCurrentRoom(roomId)}
          onCreateRoom={() => {
            const newRoomId = `OP-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
            setCurrentRoom(newRoomId)
          }}
        />
      )}
    </div>
  )
}
