import { eq } from 'drizzle-orm'

import { game } from '../../../db/schema'
import { getDB } from '../../../db/utils'
import { type BindingsEnv } from '../../../types/env'

export class GameRepository {
  constructor(private env: BindingsEnv) {}

  async findGame(id: string) {
    const db = getDB(this.env)
    return await db.query.game.findFirst({
      where: eq(game.id, id),
    })
  }

  async updateStatus(
    id: string,
    status: 'waiting' | 'playing' | 'finished',
    winnerId?: string | null,
  ) {
    const db = getDB(this.env)
    await db
      .update(game)
      .set({
        status,
        winnerId: winnerId ?? null,
        updatedAt: new Date(),
      })
      .where(eq(game.id, id))
  }

  async setPlayer2(id: string, player2Id: string | null) {
    const db = getDB(this.env)
    await db
      .update(game)
      .set({
        player2Id,
        updatedAt: new Date(),
      })
      .where(eq(game.id, id))
  }
}
