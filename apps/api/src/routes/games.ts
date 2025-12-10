import { createErrorResponse, ErrorCode } from '@repo/shared/errors'
import { CreateGameBody, JoinGameBody, UpdateGameBody } from '@repo/shared/games'
import { eq } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/d1'
import { Hono } from 'hono'

import { game } from '../db/schema'
import { BindingsEnv } from '../types/env'

type GamesEnv = { Bindings: BindingsEnv }

const gamesRouter = new Hono<GamesEnv>()

/**
 * CREATE - Create a new game
 * POST /games
 * Body: { player1Id: string, name: string, accessCode?: string }
 */
gamesRouter.post('/', async (c) => {
  const body: CreateGameBody = await c.req.json()
  const { player1Id, accessCode, name } = body

  if (!player1Id) {
    return c.json(
      createErrorResponse(ErrorCode.VALIDATION_MISSING_FIELD, 'player1Id is required'),
      400,
    )
  }

  if (!name) {
    return c.json(createErrorResponse(ErrorCode.VALIDATION_MISSING_FIELD, 'name is required'), 400)
  }

  try {
    const db = drizzle(c.env.DB)
    const newGame = {
      id: crypto.randomUUID(),
      name,
      player1Id,
      player2Id: null,
      status: 'waiting' as const,
      winnerId: null,
      accessCode: accessCode || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    await db.insert(game).values(newGame)

    return c.json(newGame, 201)
  } catch (error) {
    console.error('Error creating game:', error)
    return c.json(createErrorResponse(ErrorCode.SERVER_DATABASE_ERROR), 500)
  }
})

/**
 * READ - Get all public waiting games
 * GET /games/public
 */
gamesRouter.get('/public', async (c) => {
  try {
    const db = drizzle(c.env.DB)
    const results = await db.select().from(game)

    // Filter in memory for public waiting games
    const publicGames = results.filter(
      (g: typeof game.$inferSelect) => g.status === 'waiting' && !g.accessCode,
    )

    return c.json(publicGames)
  } catch (error) {
    console.error('Error fetching public games:', error)
    return c.json(createErrorResponse(ErrorCode.SERVER_DATABASE_ERROR), 500)
  }
})

/**
 * READ - Get a single game by ID
 * GET /games/:gameId
 */
gamesRouter.get('/:gameId', async (c) => {
  const gameId = c.req.param('gameId')

  try {
    const db = drizzle(c.env.DB)
    const result = await db.select().from(game).where(eq(game.id, gameId))

    if (result.length === 0) {
      return c.json(createErrorResponse(ErrorCode.GAME_NOT_FOUND), 404)
    }

    return c.json(result[0])
  } catch (error) {
    console.error('Error fetching game:', error)
    return c.json(createErrorResponse(ErrorCode.SERVER_DATABASE_ERROR), 500)
  }
})

/**
 * READ - Get all games for a user
 * GET /games/user/:userId
 */
gamesRouter.get('/user/:userId', async (c) => {
  const userId = c.req.param('userId')

  try {
    const db = drizzle(c.env.DB)
    const results = await db.select().from(game)

    // Filter in memory for games where user is player1 or player2
    const userGames = results.filter(
      (g: typeof game.$inferSelect) => g.player1Id === userId || g.player2Id === userId,
    )

    return c.json(userGames)
  } catch (error) {
    console.error('Error fetching user games:', error)
    return c.json(createErrorResponse(ErrorCode.SERVER_DATABASE_ERROR), 500)
  }
})

/**
 * UPDATE - Join a game as player2
 * PATCH /games/:gameId/join
 * Body: { player2Id: string, accessCode?: string }
 */
gamesRouter.patch('/:gameId/join', async (c) => {
  const gameId = c.req.param('gameId')
  const body: JoinGameBody = await c.req.json()
  const { player2Id, accessCode } = body

  if (!player2Id) {
    return c.json(
      createErrorResponse(ErrorCode.VALIDATION_MISSING_FIELD, 'player2Id is required'),
      400,
    )
  }

  try {
    const db = drizzle(c.env.DB)
    const result = await db.select().from(game).where(eq(game.id, gameId))

    if (result.length === 0) {
      return c.json(createErrorResponse(ErrorCode.GAME_NOT_FOUND), 404)
    }

    const currentGame = result[0]!

    // Check if game is still waiting
    if (currentGame.status !== 'waiting') {
      return c.json(createErrorResponse(ErrorCode.GAME_NOT_WAITING), 400)
    }

    // Check if player2 is already set
    if (currentGame.player2Id) {
      return c.json(createErrorResponse(ErrorCode.GAME_ALREADY_FULL), 400)
    }

    // Check access code if game has one
    if (currentGame.accessCode && currentGame.accessCode !== accessCode) {
      return c.json(createErrorResponse(ErrorCode.GAME_INVALID_ACCESS_CODE), 401)
    }

    // Update game
    await db
      .update(game)
      .set({
        player2Id,
        status: 'playing',
        updatedAt: new Date(),
      })
      .where(eq(game.id, gameId))

    const updatedGame = await db.select().from(game).where(eq(game.id, gameId))

    return c.json(updatedGame[0])
  } catch (error) {
    console.error('Error joining game:', error)
    return c.json(createErrorResponse(ErrorCode.SERVER_DATABASE_ERROR), 500)
  }
})

/**
 * UPDATE - Update game status
 * PATCH /games/:gameId
 * Body: { status?: 'waiting' | 'playing' | 'finished', winnerId?: string }
 */
gamesRouter.patch('/:gameId', async (c) => {
  const gameId = c.req.param('gameId')
  const body: UpdateGameBody = await c.req.json()
  const { status, winnerId } = body

  try {
    const db = drizzle(c.env.DB)
    const result = await db.select().from(game).where(eq(game.id, gameId))

    if (result.length === 0) {
      return c.json(createErrorResponse(ErrorCode.GAME_NOT_FOUND), 404)
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    }

    if (status) {
      updateData.status = status
    }

    if (winnerId) {
      updateData.winnerId = winnerId
    }

    await db.update(game).set(updateData).where(eq(game.id, gameId))

    const updatedGame = await db.select().from(game).where(eq(game.id, gameId))

    return c.json(updatedGame[0])
  } catch (error) {
    console.error('Error updating game:', error)
    return c.json(createErrorResponse(ErrorCode.SERVER_DATABASE_ERROR), 500)
  }
})

/**
 * DELETE - Delete a game
 * DELETE /games/:gameId
 */
gamesRouter.delete('/:gameId', async (c) => {
  const gameId = c.req.param('gameId')

  try {
    const db = drizzle(c.env.DB)
    const result = await db.select().from(game).where(eq(game.id, gameId))

    if (result.length === 0) {
      return c.json(createErrorResponse(ErrorCode.GAME_NOT_FOUND), 404)
    }

    await db.delete(game).where(eq(game.id, gameId))

    return c.json({ message: 'Game deleted successfully' })
  } catch (error) {
    console.error('Error deleting game:', error)
    return c.json(createErrorResponse(ErrorCode.SERVER_DATABASE_ERROR), 500)
  }
})

export { gamesRouter }
