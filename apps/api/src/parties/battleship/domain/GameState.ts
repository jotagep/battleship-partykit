import type { GamePhase, GameRolePlayer } from '@repo/shared/battleship'

import { type PlayerState } from './PlayerState'

export interface GameState {
  phase: GamePhase
  turn: GameRolePlayer
  winner?: GameRolePlayer
  players: Partial<Record<GameRolePlayer, PlayerState>>
}
