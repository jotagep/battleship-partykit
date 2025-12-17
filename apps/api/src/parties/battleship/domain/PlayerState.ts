import { type Coordinate, type FleetState } from '@repo/shared/battleship'

import { type User } from '../../../db/schema'

export interface PlayerState {
  user: User
  fleet?: FleetState
  shotsFired?: Coordinate[]
}
