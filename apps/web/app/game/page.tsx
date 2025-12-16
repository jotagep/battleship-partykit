'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

import { GameRoom } from '@/components/game/GameRoom'
import { Loading } from '@/components/ui/Loading'

import { useGameRoomStore } from '@/lib/stores/gameStore'
import { useLobbyStore } from '@/lib/stores/lobby-store'

export default function GamePage() {
  const searchParams = useSearchParams()
  const roomId = searchParams.get('roomId')

  const router = useRouter()
  const { games, isLoading, fetchGameById } = useLobbyStore()
  const { resetGame } = useGameRoomStore()
  const [hasFetched, setHasFetched] = useState(false)

  const game = games.find((g) => g.id === roomId)

  useEffect(() => {
    if (!roomId) {
      router.replace(`/`)
      return
    }

    if (!game?.id) {
      fetchGameById(roomId)
      setHasFetched(true)
    }
    return () => {
      resetGame()
    }
  }, [game?.id, roomId, resetGame, fetchGameById, router])

  useEffect(() => {
    if (hasFetched && !isLoading) {
      router.replace('/')
      return
    }
  }, [hasFetched, isLoading, roomId, router])

  const handleOnLeave = useCallback(() => {
    router.push('/')
  }, [router])

  if (!game || isLoading) {
    return <Loading text="Loading mission…" />
  }

  return <GameRoom game={game} onLeave={handleOnLeave} />
}
