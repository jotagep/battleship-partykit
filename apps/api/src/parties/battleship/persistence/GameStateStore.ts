import { type SyncKvStorage } from '@cloudflare/workers-types'

import { type GameState } from '../domain/GameState'

const GAME_STATE_KEY = 'game-state'

export class GameStateStore {
  constructor(private storage: SyncKvStorage) {}

  save(state: GameState): void {
    this.storage.put<GameState>(GAME_STATE_KEY, state)
  }

  load(): GameState | null {
    return this.storage.get<GameState>(GAME_STATE_KEY) || null
  }

  clear(): void {
    this.storage.delete(GAME_STATE_KEY)
  }
}
