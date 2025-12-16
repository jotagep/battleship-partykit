'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'

import { Lobby } from '@/components/lobby/Lobby'

export default function Home() {
  const router = useRouter()

  const handleJoinRoom = useCallback(
    (roomId: string) => {
      router.push(`/game?roomId=${roomId}`)
    },
    [router],
  )

  return <Lobby onJoinRoom={handleJoinRoom} />
}
