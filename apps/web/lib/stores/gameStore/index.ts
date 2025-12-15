import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

import { type ChatSlice, createChatSlice } from './chat.slice'
import { createGameSlice, type GameSlice } from './game.slice'
import { createRoomSlice, type RoomSlice } from './room.slice'

export type GameRoomState = GameSlice & ChatSlice & RoomSlice

export const useGameRoomStore = create<GameRoomState>()(
  devtools(
    (...a) => ({
      ...createGameSlice(...a),
      ...createChatSlice(...a),
      ...createRoomSlice(...a),
    }),
    { name: 'GameRoomStore' },
  ),
)
