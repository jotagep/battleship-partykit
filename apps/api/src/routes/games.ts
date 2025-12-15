import {
  createErrorResponse,
  createSuccessResponse,
  ErrorCode,
  SuccessCode,
} from '@repo/shared/apiMessage'
import { CreateGameBody, JoinGameBody, UpdateGameBody } from '@repo/shared/games'
import { desc, eq, not } from 'drizzle-orm'
import { Hono } from 'hono'

import { game } from '../db/schema'
import { getDB } from '../db/utils'
import { authMiddleware } from '../middleware/auth.middleware'
import { BindingsEnv, VariablesEnv } from '../types/env'

type GamesEnv = { Bindings: BindingsEnv; Variables: VariablesEnv }

const gamesRouter = new Hono<GamesEnv>()

gamesRouter.use('*', authMiddleware)

/**
 * CREATE - Create a new game
 * POST /games
 * Body: CreateGameBody
 */
gamesRouter.post('/', async (c) => {
  const user = c.get('USER')
  const player1Id = user.id
  const body: CreateGameBody = await c.req.json()
  const { accessCode, name } = body

  if (!name) {
    return c.json(createErrorResponse(ErrorCode.VALIDATION_MISSING_FIELD, 'name is required'), 400)
  }

  try {
    const db = getDB(c.env)
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

    const createdGame = { ...newGame, accessCode: undefined, hasPassword: !!accessCode }

    return c.json(createSuccessResponse(SuccessCode.GAME_CREATED, createdGame), 201)
  } catch (error) {
    console.error('Error creating game:', error)
    return c.json(createErrorResponse(ErrorCode.SERVER_DATABASE_ERROR), 500)
  }
})

/**
 * READ - Get all games not finished
 * GET /games/active
 */
gamesRouter.get('/active', async (c) => {
  try {
    const db = getDB(c.env)
    const results = await db.query.game.findMany({
      where: not(eq(game.status, 'finished')),
      orderBy: [desc(game.createdAt)],
    })

    const gamesWithoutAccessCode = results.map(({ accessCode, ...game }) => ({
      hasPassword: !!accessCode,
      ...game,
    }))

    return c.json(createSuccessResponse(SuccessCode.GAME_RETRIEVED, gamesWithoutAccessCode))
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
    const db = getDB(c.env)
    const result = await db.query.game.findFirst({
      where: eq(game.id, gameId),
    })

    if (!result) {
      return c.json(createErrorResponse(ErrorCode.GAME_NOT_FOUND), 404)
    }

    return c.json(createSuccessResponse(SuccessCode.GAME_RETRIEVED, result))
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
    const db = getDB(c.env)
    // Get games where user is player1 or player2
    const [player1Games, player2Games] = await Promise.all([
      db.query.game.findMany({
        where: eq(game.player1Id, userId),
      }),
      db.query.game.findMany({
        where: eq(game.player2Id, userId),
      }),
    ])

    const userGames = [...player1Games, ...player2Games]

    return c.json(createSuccessResponse(SuccessCode.GAME_RETRIEVED, userGames))
  } catch (error) {
    console.error('Error fetching user games:', error)
    return c.json(createErrorResponse(ErrorCode.SERVER_DATABASE_ERROR), 500)
  }
})

/**
 * UPDATE - Join a game as player2
 * PATCH /games/:gameId/join
 * Body: JoinGameBody
 */
gamesRouter.patch('/:gameId/join', async (c) => {
  const user = c.get('USER')
  const player2Id = user.id

  const gameId = c.req.param('gameId')
  const body: JoinGameBody = await c.req.json()
  const { accessCode } = body

  try {
    const db = getDB(c.env)
    const currentGame = await db.query.game.findFirst({
      where: eq(game.id, gameId),
    })

    if (!currentGame) {
      return c.json(createErrorResponse(ErrorCode.GAME_NOT_FOUND), 404)
    }

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
        status: 'deployment',
        updatedAt: new Date(),
      })
      .where(eq(game.id, gameId))

    const updatedGame = await db.query.game.findFirst({
      where: eq(game.id, gameId),
    })

    return c.json(createSuccessResponse(SuccessCode.GAME_JOINED, updatedGame))
  } catch (error) {
    console.error('Error joining game:', error)
    return c.json(createErrorResponse(ErrorCode.SERVER_DATABASE_ERROR), 500)
  }
})

/**
 * UPDATE - Update game status
 * PATCH /games/:gameId
 * Body: UpdateGameBody
 */
gamesRouter.patch('/:gameId', async (c) => {
  const gameId = c.req.param('gameId')
  const body: UpdateGameBody = await c.req.json()
  const { status, winnerId } = body

  try {
    const db = getDB(c.env)
    const existingGame = await db.query.game.findFirst({
      where: eq(game.id, gameId),
    })

    if (!existingGame) {
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

    const updatedGame = await db.query.game.findFirst({
      where: eq(game.id, gameId),
    })

    return c.json(createSuccessResponse(SuccessCode.GAME_UPDATED, updatedGame))
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
    const db = getDB(c.env)
    const existingGame = await db.query.game.findFirst({
      where: eq(game.id, gameId),
    })

    if (!existingGame) {
      return c.json(createErrorResponse(ErrorCode.GAME_NOT_FOUND), 404)
    }

    await db.delete(game).where(eq(game.id, gameId))

    return c.json(
      createSuccessResponse(SuccessCode.GAME_DELETED, {
        message: 'Game deleted successfully',
      }),
    )
  } catch (error) {
    console.error('Error deleting game:', error)
    return c.json(createErrorResponse(ErrorCode.SERVER_DATABASE_ERROR), 500)
  }
})

export { gamesRouter }
