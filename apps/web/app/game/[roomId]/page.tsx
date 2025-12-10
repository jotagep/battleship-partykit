'use client'

import { use, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { GameRoom } from '@/components/game/GameRoom'
import { Loading } from '@/components/ui/Loading'

import { useLobbyStore } from '@/lib/stores/lobby-store'

export default function GamePage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId: roomName } = use(params)
  const router = useRouter()
  const { games, isLoading, fetchGames } = useLobbyStore()

  const roomId = games.find((g) => g.name === roomName)?.id

  useEffect(() => {
    if (!roomId) {
      fetchGames()
    }
  }, [roomId, fetchGames])

  if (!roomId || isLoading) {
    return <Loading text="Loading mission…" />
  }

  return <GameRoom roomId={roomId} roomName={roomName} onLeave={() => router.push('/')} />
}
