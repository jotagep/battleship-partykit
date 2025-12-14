'use client'

import type { FleetPlacement } from '@repo/shared/battleship'
import { create } from 'zustand'

type GameRoomStatus = 'connecting' | 'connected' | 'closed' | 'error'

type GamePhase = 'preparing' | 'playing' | 'finished'

// Unified message types
export type LogMessage = {
  id: string
  type: 'log'
  text: string
  kind: 'system' | 'game'
  timestamp: number
}

export type ChatMessage = {
  id: string
  type: 'chat'
  text: string
  from: string
  isLocal: boolean
  timestamp: number
}

export type GameMessage = LogMessage | ChatMessage

type GameRoomState = {
  host: string
  status: GameRoomStatus
  messages: GameMessage[]
  gamePhase: GamePhase
  deployedFleet: FleetPlacement | null

  setHost: (host: string) => void
  setStatus: (status: GameRoomStatus) => void
  setGamePhase: (phase: GamePhase) => void
  setDeployedFleet: (fleet: FleetPlacement | null) => void

  addLog: (text: string, kind?: LogMessage['kind']) => void
  addChatMessage: (text: string, from: string, isLocal?: boolean) => void
  clearMessages: () => void

  resetGame: () => void
}

const generateId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `log-${Math.random().toString(36).slice(2)}`

export const useGameRoomStore = create<GameRoomState>((set) => ({
  host: 'localhost:8787',
  status: 'connecting',
  messages: [],
  gamePhase: 'preparing',
  deployedFleet: null,

  setHost: (host) => set({ host }),
  setStatus: (status) => set({ status }),
  setGamePhase: (gamePhase) => set({ gamePhase }),
  setDeployedFleet: (deployedFleet) => set({ deployedFleet }),

  addLog: (text, kind = 'system') =>
    set((state) => ({
      messages: [
        ...state.messages,
        { id: generateId(), type: 'log', text, kind, timestamp: Date.now() },
      ],
    })),

  addChatMessage: (text, from, isLocal = false) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { id: generateId(), type: 'chat', text, from, isLocal, timestamp: Date.now() },
      ],
    })),

  clearMessages: () => set({ messages: [] }),
  resetGame: () =>
    set({
      status: 'connecting',
      gamePhase: 'preparing',
      deployedFleet: null,
      messages: [],
    }),
}))
