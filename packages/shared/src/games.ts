// Game-related types shared between client and server

/**
 * Game status enum
 */
export type GameStatus = 'waiting' | 'deployment' | 'playing' | 'finished'

/**
 * Create game request body
 */
export interface CreateGameBody {
  name: string
  accessCode?: string
}

/**
 * Join game request body
 */
export interface JoinGameBody {
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

export interface GameActive extends Omit<Game, 'accessCode'> {
  hasPassword: boolean
}

export interface GameHistory extends Game {
  player1: {
    id: string
    name: string
    image?: string | null
  }
  player2: {
    id: string
    name: string
    image?: string | null
  } | null
  winner: {
    id: string
    name: string
  } | null
}
