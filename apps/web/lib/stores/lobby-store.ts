'use client'

import { type SuccessResponse } from '@repo/shared/apiMessage'
import { type Game } from '@repo/shared/games'
import { create } from 'zustand'

type LobbyState = {
  games: Game[]
  isLoading: boolean
  isCreating: boolean
  error: string | null
  fetchGames: () => Promise<void>
  createGame: (input: { name: string; accessCode?: string; player1Id: string }) => Promise<Game>
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:8787'

export const useLobbyStore = create<LobbyState>((set) => ({
  games: [],
  isLoading: false,
  isCreating: false,
  error: null,
  fetchGames: async () => {
    set({ isLoading: true, error: null })

    try {
      const response = await fetch(`${API_BASE_URL}/games/active`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch games')
      }

      const payload = (await response.json()) as SuccessResponse<Game[]>

      if (!payload.success) {
        throw new Error(payload.message || 'Failed to fetch games')
      }

      set({ games: payload.data ?? [], isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      set({ error: message, isLoading: false })
    }
  },
  createGame: async ({ name, accessCode, player1Id }) => {
    set({ isCreating: true, error: null })

    try {
      const response = await fetch(`${API_BASE_URL}/games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, accessCode, player1Id }),
      })

      if (!response.ok) {
        throw new Error('Failed to create game')
      }

      const payload = (await response.json()) as SuccessResponse<Game>

      if (!payload.success || !payload.data) {
        throw new Error(payload.message || 'Failed to create game')
      }

      const createdGame: Game = payload.data

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
}))
