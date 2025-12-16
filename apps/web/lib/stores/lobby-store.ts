import { type GameActive } from '@repo/shared/games'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import { type CreateGameInput, gamesApi, JoinGameInput } from '@/lib/api/games.api'

type LobbyState = {
  games: GameActive[]
  isLoading: boolean
  isCreating: boolean
  isJoining: boolean
  error: string | null
  fetchGames: () => Promise<void>
  fetchGameById: (gameId: string) => Promise<GameActive>
  createGame: (input: CreateGameInput) => Promise<GameActive>
  joinGame: (input: JoinGameInput) => Promise<void>
}

export const useLobbyStore = create<LobbyState>()(
  devtools(
    (set) => ({
      games: [],
      isLoading: false,
      isCreating: false,
      isJoining: false,
      error: null,
      fetchGames: async () => {
        set({ isLoading: true, error: null })

        try {
          const games = await gamesApi.fetchActiveGames()
          set({ games, isLoading: false })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error'
          set({ error: message, isLoading: false })
        }
      },
      fetchGameById: async (gameId: string) => {
        set({ isLoading: true, error: null })

        try {
          const game = await gamesApi.fetchGameById(gameId)

          set((state) => {
            const existingGameIndex = state.games.findIndex((g) => g.id === gameId)

            if (existingGameIndex !== -1) {
              const updatedGames = [...state.games]
              updatedGames[existingGameIndex] = game
              return { games: updatedGames, isLoading: false }
            } else {
              return { games: [game, ...state.games], isLoading: false }
            }
          })

          return game
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error'
          set({ error: message, isLoading: false })
          throw error
        }
      },
      createGame: async (input) => {
        set({ isCreating: true, error: null })

        try {
          const createdGame = await gamesApi.createGame(input)

          set((state) => ({
            ...state,
            games: [createdGame, ...state.games],
            isCreating: false,
          }))

          return createdGame
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Unknown error'
          set({ error: message, isCreating: false })
          throw error
        }
      },
      joinGame: async (input: JoinGameInput) => {
        set({ isJoining: true, error: null })

        try {
          const updatedGame = await gamesApi.joinGame(input)
          set((state) => ({
            ...state,
            games: state.games.map((g) => (g.id === input.gameId ? updatedGame : g)),
            isJoining: false,
          }))
        } catch (error) {
          set({ isJoining: false })
          throw error
        }
      },
    }),
    { name: 'LobbyStore' },
  ),
)
