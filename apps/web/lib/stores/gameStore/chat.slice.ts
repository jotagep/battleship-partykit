import type { StateCreator } from 'zustand'

import { generateId } from '@/lib/utils'

type LogMessage = {
  id: string
  type: 'log'
  text: string
  kind: 'system' | 'game'
  timestamp: number
}

type ChatMessage = {
  id: string
  type: 'chat'
  text: string
  from: string
  isLocal: boolean
  timestamp: number
}

type GameMessage = LogMessage | ChatMessage

export type ChatSlice = {
  messages: GameMessage[]
  addLog: (text: string, kind?: LogMessage['kind']) => void
  addChatMessage: (text: string, from: string, isLocal?: boolean) => void
  clearMessages: () => void
}

export const createChatSlice: StateCreator<ChatSlice, [], [], ChatSlice> = (set) => ({
  messages: [],

  addLog: (text, kind = 'system') =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: generateId(),
          type: 'log',
          text,
          kind,
          timestamp: Date.now(),
        },
      ],
    })),

  addChatMessage: (text, from, isLocal = false) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          id: generateId(),
          type: 'chat',
          text,
          from,
          isLocal,
          timestamp: Date.now(),
        },
      ],
    })),

  clearMessages: () => set({ messages: [] }),
})
