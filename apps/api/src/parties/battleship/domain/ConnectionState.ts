import { GameRolePlayer } from '@repo/shared/battleship'

import { type User } from '../../../db/schema'

export interface ConnectionState {
  user: User
  role: GameRolePlayer
}
