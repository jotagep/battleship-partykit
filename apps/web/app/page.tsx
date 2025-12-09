'use client'

import { useRouter } from 'next/navigation'

import { Login } from '@/components/lobby/Login'
import { RoomList } from '@/components/lobby/RoomList'
import { Loading } from '@/components/ui/Loading'

import { authClient } from '@/lib/auth'

export default function Home() {
  const { data: session, isPending: sessionLoading } = authClient.useSession()
  const router = useRouter()

  if (sessionLoading) {
    return <Loading />
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
