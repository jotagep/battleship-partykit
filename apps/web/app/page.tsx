'use client'

import { useRouter } from 'next/navigation'

import { RoomList } from '@/components/lobby/RoomList'

export default function Home() {
  const router = useRouter()

  return (
    <RoomList
      onJoinRoom={(roomId) => router.push(`/game/${roomId}`)}
      onCreateRoom={() => {
        const newRoomId = `OP-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
        router.push(`/game/${newRoomId}`)
      }}
    />
  )
}
