import type { StateCreator } from 'zustand'

import type { ChatSlice } from './chat.slice'
import type { GameSlice } from './game.slice'

type GameRoomStatus = 'connecting' | 'connected' | 'closed' | 'error'

export type RoomSlice = {
  host: string
  status: GameRoomStatus
  setHost: (host: string) => void
  setStatus: (status: GameRoomStatus) => void
  resetGame: () => void
}

export const createRoomSlice: StateCreator<RoomSlice & GameSlice & ChatSlice, [], [], RoomSlice> = (
  set,
) => ({
  host: 'localhost:8787',
  status: 'connecting',

  setHost: (host) => set({ host }),
  setStatus: (status) => set({ status }),

  resetGame: () =>
    set({
      status: 'connecting',
      gamePhase: 'preparing',
      deployedFleet: null,
      winner: null,
      messages: [],
      turn: null,
      myRole: null,
      myShots: [],
      opponentShots: [],
    }),
})
