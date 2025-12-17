import { type GameRolePlayer } from '@repo/shared/battleship'
import { RoomCloseCode } from '@repo/shared/messages'

import { auth } from '../../../auth'
import { type User } from '../../../db/schema'
import { type BindingsEnv } from '../../../types/env'
import { GameError } from '../domain/errors'
import { GameRepository } from '../persistence/GameRepository'

export async function resolvePlayer(
  env: BindingsEnv,
  request: Request,
  gameId: string,
): Promise<{ user: User; role: GameRolePlayer }> {
  const cookie = request.headers.get('cookie') ?? ''
  const response = await auth(env).api.getSession({ headers: { cookie } })

  if (!response || !response.session || !response.user) {
    throw new GameError('Unauthorized', RoomCloseCode.UNAUTHORIZED)
  }

  const gameRepo = new GameRepository(env)
  const gameData = await gameRepo.findGame(gameId)

  if (!gameData) {
    throw new GameError('Game not found', RoomCloseCode.ROOM_NOT_FOUND)
  }

  if (gameData.player1Id !== response.user.id && gameData.player2Id !== response.user.id) {
    throw new GameError('Unauthorized', RoomCloseCode.UNAUTHORIZED)
  }

  const user: User = response.user as User
  const role = user.id === gameData.player1Id ? 'player1' : 'player2'

  return { user, role }
}
