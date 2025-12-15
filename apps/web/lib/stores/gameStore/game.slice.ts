import type { FleetPlacement, GamePhase } from '@repo/shared/battleship'
import type { ShotRecord } from '@repo/shared/messages'
import type { StateCreator } from 'zustand'

export type GameSlice = {
  gamePhase: GamePhase
  deployedFleet: FleetPlacement | null
  turn: 'player1' | 'player2' | null
  winner: 'player1' | 'player2' | null
  myRole: 'player1' | 'player2' | null
  myShots: ShotRecord[]
  opponentShots: ShotRecord[]
  players: { player1: { name: string }; player2: { name: string } } | null

  setGamePhase: (phase: GamePhase) => void
  setDeployedFleet: (fleet: FleetPlacement | null) => void
  setTurn: (turn: GameSlice['turn']) => void
  setWinner: (winner: GameSlice['winner']) => void
  setPlayers: (players: GameSlice['players']) => void
  setMyRole: (role: GameSlice['myRole']) => void
  setMyShots: (shots: ShotRecord[]) => void
  setOpponentShots: (shots: ShotRecord[]) => void
  addMyShot: (shot: ShotRecord) => void
  addOpponentShot: (shot: ShotRecord) => void
}

export const createGameSlice: StateCreator<GameSlice, [], [], GameSlice> = (set) => ({
  gamePhase: 'preparing',
  deployedFleet: null,
  turn: null,
  winner: null,
  myRole: null,
  myShots: [],
  opponentShots: [],
  players: null,

  setGamePhase: (gamePhase) => set({ gamePhase }),
  setDeployedFleet: (deployedFleet) => set({ deployedFleet }),
  setTurn: (turn) => set({ turn }),
  setWinner: (winner) => set({ winner }),
  setMyRole: (myRole) => set({ myRole }),
  setPlayers: (players) => set({ players }),
  setMyShots: (shots) => set({ myShots: shots }),
  setOpponentShots: (shots) => set({ opponentShots: shots }),
  addMyShot: (shot) => set((s) => ({ myShots: [...s.myShots, shot] })),
  addOpponentShot: (shot) => set((s) => ({ opponentShots: [...s.opponentShots, shot] })),
})
