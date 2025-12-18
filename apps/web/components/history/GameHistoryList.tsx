'use client'

import { useEffect } from 'react'

import { useHistoryStore } from '@/lib/stores/history-store'

import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card'
import { Spinner } from '../ui/Spinner'

import { GameHistoryPagination } from './GameHistoryPagination'
import { GameHistoryRow } from './GameHistoryRow'

interface GameHistoryListProps {
  userId: string
}

export function GameHistoryList({ userId }: GameHistoryListProps) {
  const {
    isLoading,
    error,
    fetchHistory,
    currentPage,
    setCurrentPage,
    getTotalPages,
    getPaginatedGames,
    getStats,
  } = useHistoryStore()

  useEffect(() => {
    void fetchHistory()
  }, [fetchHistory])

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">{error}</div>
  }

  const paginatedGames = getPaginatedGames()
  const totalPages = getTotalPages()
  const { wins, losses, winRate } = getStats(userId)

  if (paginatedGames.length === 0 && currentPage === 1) {
    return (
      <div className="text-center p-8 text-slate-400">No has jugado ninguna partida todavía.</div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>HISTORY LOGS</CardTitle>
          <div className="flex gap-6 font-spacemono text-xs">
            <div className="flex flex-col items-end">
              <span className="text-slate-500 uppercase tracking-tighter">Wins</span>
              <span className="text-lime-400 font-bold text-lg">{wins}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-slate-500 uppercase tracking-tighter">Losses</span>
              <span className="text-red-400 font-bold text-lg">{losses}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-slate-500 uppercase tracking-tighter">Win Rate</span>
              <span className="text-cyan-400 font-bold text-lg">{winRate.toFixed(1)}%</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="grid grid-cols-4 gap-4 p-4 border-b border-slate-800 bg-slate-950/50 text-xs font-spacemono text-slate-400 uppercase tracking-wider">
            <div>Mission ID</div>
            <div className="text-center">Opponent</div>
            <div className="text-center">Result</div>
            <div className="text-right">Date</div>
          </div>

          <div className="divide-y divide-slate-800/50">
            {paginatedGames.map((game) => (
              <GameHistoryRow key={game.id} game={game} currentUserId={userId} />
            ))}
          </div>
        </CardContent>
      </Card>

      <GameHistoryPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}
