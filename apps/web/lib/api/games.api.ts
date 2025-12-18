import { type SuccessResponse } from '@repo/shared/apiMessage'
import { type GameActive, type GameHistory } from '@repo/shared/games'

import { API_BASE_URL } from '@/config'

export interface CreateGameInput {
  name: string
  accessCode?: string
  player1Id: string
}

export interface JoinGameInput {
  gameId: string
  accessCode?: string
}

/**
 * Games API Service
 * Handles all HTTP requests related to game operations
 */
export const gamesApi = {
  /**
   * Fetch all active games from the server
   */
  async fetchActiveGames(): Promise<GameActive[]> {
    const response = await fetch(`${API_BASE_URL}/games/active`, {
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Failed to fetch games')
    }

    const payload: SuccessResponse<GameActive[]> = await response.json()

    if (!payload.success) {
      throw new Error(payload.message || 'Failed to fetch games')
    }

    return payload.data ?? []
  },

  /**
   * Create a new game
   */
  async createGame(input: CreateGameInput): Promise<GameActive> {
    const response = await fetch(`${API_BASE_URL}/games`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      throw new Error('Failed to create game')
    }

    const payload: SuccessResponse<GameActive> = await response.json()

    if (!payload.success || !payload.data) {
      throw new Error(payload.message || 'Failed to create game')
    }

    return payload.data
  },

  /**
   * Fetch a single game by ID
   */
  async fetchGameById(gameId: string): Promise<GameActive> {
    const response = await fetch(`${API_BASE_URL}/games/${gameId}`, {
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Failed to fetch game')
    }

    const payload: SuccessResponse<GameActive> = await response.json()

    if (!payload.success || !payload.data) {
      throw new Error(payload.message || 'Failed to fetch game')
    }

    return payload.data
  },

  /**
   * Fetch game history for the current user
   */
  async fetchGameHistory(): Promise<GameHistory[]> {
    const response = await fetch(`${API_BASE_URL}/games/history`, {
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Failed to fetch game history')
    }

    const payload: SuccessResponse<GameHistory[]> = await response.json()

    if (!payload.success) {
      throw new Error(payload.message || 'Failed to fetch game history')
    }

    return payload.data ?? []
  },

  /**
   * Join an existing game
   */
  async joinGame({ gameId, accessCode }: JoinGameInput): Promise<GameActive> {
    const response = await fetch(`${API_BASE_URL}/games/${gameId}/join`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ accessCode }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to join game')
    }

    const payload: SuccessResponse<GameActive> = await response.json()

    if (!payload.success || !payload.data) {
      throw new Error(payload.message || 'Failed to join game')
    }

    return payload.data
  },
}
