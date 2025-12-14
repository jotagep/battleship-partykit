'use client'

import { use, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { GameRoom } from '@/components/game/GameRoom'
import { Loading } from '@/components/ui/Loading'

import { useGameRoomStore } from '@/lib/stores/game-room-store'
import { useLobbyStore } from '@/lib/stores/lobby-store'

export default function GamePage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId: roomName } = use(params)

  const router = useRouter()
  const { games, isLoading, fetchGames } = useLobbyStore()
  const { resetGame } = useGameRoomStore()

  const game = games.find((g) => g.name === roomName)
  const roomId = game?.id

  useEffect(() => {
    if (!roomId) {
      fetchGames()
    }

    return () => {
      resetGame()
    }
  }, [roomId, resetGame, fetchGames])

  if (!roomId || isLoading) {
    return <Loading text="Loading mission…" />
  }

  return <GameRoom game={game} onLeave={() => router.push('/')} />
}
