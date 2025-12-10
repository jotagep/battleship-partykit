'use client'

import { useRouter } from 'next/navigation'

import { Lobby } from '@/components/lobby/Lobby'

export default function Home() {
  const router = useRouter()

  return <Lobby onJoinRoom={(roomId) => router.push(`/game/${roomId}`)} />
}
