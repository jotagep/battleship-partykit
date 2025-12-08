'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'

import { GameRoom } from '@/components/game/GameRoom'

export default function GamePage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params)
  const router = useRouter()

  return <GameRoom roomId={roomId} onLeave={() => router.push('/')} />
}
