// Game-related types shared between client and server

/**
 * Game status enum
 */
export type GameStatus = 'waiting' | 'playing' | 'finished'

/**
 * Create game request body
 */
export interface CreateGameBody {
  player1Id: string
  name: string
  accessCode?: string
}

/**
 * Join game request body
 */
export interface JoinGameBody {
  player2Id: string
  accessCode?: string
}

/**
 * Update game request body
 */
export interface UpdateGameBody {
  status?: GameStatus
  winnerId?: string
}

/**
 * Game entity from database
 */
export interface Game {
  id: string
  name: string
  player1Id: string
  player2Id: string | null
  status: GameStatus
  winnerId: string | null
  accessCode: string | null
  createdAt: Date
  updatedAt: Date
}
