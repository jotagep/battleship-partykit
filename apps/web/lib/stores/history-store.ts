import { type GameHistory } from '@repo/shared/games'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import { gamesApi } from '@/lib/api/games.api'

type HistoryState = {
  games: GameHistory[]
  isLoading: boolean
  error: string | null
  currentPage: number
  pageSize: number
  fetchHistory: () => Promise<void>
  setCurrentPage: (page: number) => void
  getTotalPages: () => number
  getPaginatedGames: () => GameHistory[]
  getStats: (userId: string) => { wins: number; losses: number; winRate: number }
}

export const useHistoryStore = create<HistoryState>()(
  devtools(
    (set, get) => ({
      games: [],
      isLoading: false,
      error: null,
      currentPage: 1,
      pageSize: 10,
      fetchHistory: async () => {
        set({ isLoading: true, error: null })

        try {
          const games = await gamesApi.fetchGameHistory()
          set({ games, isLoading: false, currentPage: 1 })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error'
          set({ error: message, isLoading: false })
        }
      },
      setCurrentPage: (page: number) => {
        set({ currentPage: page })
      },
      getTotalPages: () => {
        const { games, pageSize } = get()
        return Math.ceil(games.length / pageSize)
      },
      getPaginatedGames: () => {
        const { games, currentPage, pageSize } = get()
        const start = (currentPage - 1) * pageSize
        const end = start + pageSize
        return games.slice(start, end)
      },
      getStats: (userId: string) => {
        const { games } = get()
        const finishedGames = games.filter((g) => g.status === 'finished')
        const wins = finishedGames.filter((g) => g.winnerId === userId).length
        const losses = finishedGames.filter((g) => g.winnerId && g.winnerId !== userId).length
        const winRate = finishedGames.length > 0 ? (wins / finishedGames.length) * 100 : 0

        return { wins, losses, winRate }
      },
    }),
    { name: 'HistoryStore' },
  ),
)
