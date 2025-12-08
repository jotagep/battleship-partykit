'use client'

import { useRouter } from 'next/navigation'

import { Login } from '@/components/lobby/Login'
import { RoomList } from '@/components/lobby/RoomList'

import { authClient } from '@/lib/auth'

export default function Home() {
  const { data: session, isPending: sessionLoading } = authClient.useSession()
  const router = useRouter()

  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-cyan-500 font-spacemono">
        INITIALIZING SYSTEM...
      </div>
    )
  }

  return (
    <>
      {!session ? (
        <Login />
      ) : (
        <RoomList
          onJoinRoom={(roomId) => router.push(`/game/${roomId}`)}
          onCreateRoom={() => {
            const newRoomId = `OP-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
            router.push(`/game/${newRoomId}`)
          }}
        />
      )}
    </>
  )
}
