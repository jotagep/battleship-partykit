'use client'

import type { FleetPlacement } from '@repo/shared/battleship'
import type { ShotRecord } from '@repo/shared/messages'
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
  turn: 'player1' | 'player2' | null
  winner: 'player1' | 'player2' | null
  myRole: 'player1' | 'player2' | null
  myShots: ShotRecord[]
  opponentShots: ShotRecord[]
  players: { player1: { name: string }; player2: { name: string } } | null

  setHost: (host: string) => void
  setStatus: (status: GameRoomStatus) => void
  setGamePhase: (phase: GamePhase) => void
  setDeployedFleet: (fleet: FleetPlacement | null) => void
  setTurn: (turn: 'player1' | 'player2' | null) => void
  setWinner: (winner: 'player1' | 'player2' | null) => void
  setMyRole: (role: 'player1' | 'player2' | null) => void
  setMyShots: (shots: ShotRecord[]) => void
  setOpponentShots: (shots: ShotRecord[]) => void
  setPlayers: (players: { player1: { name: string }; player2: { name: string } } | null) => void
  addMyShot: (shot: ShotRecord) => void
  addOpponentShot: (shot: ShotRecord) => void

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
  winner: null,
  turn: null,
  myRole: null,
  myShots: [],
  opponentShots: [],
  players: null,

  setHost: (host) => set({ host }),
  setStatus: (status) => set({ status }),
  setGamePhase: (gamePhase) => set({ gamePhase }),
  setDeployedFleet: (deployedFleet) => set({ deployedFleet }),
  setWinner: (winner) => set({ winner }),
  setTurn: (turn) => set({ turn }),
  setMyRole: (myRole) => set({ myRole }),
  setMyShots: (myShots) => set({ myShots }),
  setOpponentShots: (opponentShots) => set({ opponentShots }),
  setPlayers: (players) => set({ players }),
  addMyShot: (shot) => set((state) => ({ myShots: [...state.myShots, shot] })),
  addOpponentShot: (shot) => set((state) => ({ opponentShots: [...state.opponentShots, shot] })),

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
      winner: null,
      messages: [],
      turn: null,
      myRole: null,
      myShots: [],
      opponentShots: [],
    }),
}))
