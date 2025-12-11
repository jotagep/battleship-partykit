'use client'

import { create } from 'zustand'

type GameRoomStatus = 'connecting' | 'connected' | 'closed' | 'error'
export type LogKind = 'system' | 'local' | 'remote'
export type LogEntry = {
  id: string
  text: string
  kind: LogKind
  from?: string
}

type GameRoomState = {
  host: string
  status: GameRoomStatus
  log: LogEntry[]
  setHost: (host: string) => void
  setStatus: (status: GameRoomStatus) => void
  appendLog: (entry: Omit<LogEntry, 'id'>) => void
  resetLog: (entry?: Omit<LogEntry, 'id'>) => void
}

const generateId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `log-${Math.random().toString(36).slice(2)}`

export const useGameRoomStore = create<GameRoomState>((set) => ({
  host: 'localhost:8787',
  status: 'connecting',
  log: [],
  setHost: (host) => set({ host }),
  setStatus: (status) => set({ status }),
  appendLog: (entry) => set((state) => ({ log: [...state.log, { id: generateId(), ...entry }] })),
  resetLog: (entry) =>
    set({
      log: entry ? [{ id: generateId(), ...entry }] : [],
    }),
}))
