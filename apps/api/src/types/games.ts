export type GameStatus = 'waiting' | 'playing' | 'finished'

export interface CreateGameBody {
  player1Id: string
  name: string
  accessCode?: string
}

export interface JoinGameBody {
  player2Id: string
  accessCode?: string
}

export interface UpdateGameBody {
  status?: GameStatus
  winnerId?: string
}
