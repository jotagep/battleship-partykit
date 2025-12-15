'use client'

import { Trophy, XCircle } from 'lucide-react'

import { useGameRoomStore } from '@/lib/stores/gameStore'

import { TacticalButton } from '../../ui/TacticalButton'

interface GameFinishedProps {
  onLeave: () => void
}

export function GameFinished({ onLeave }: GameFinishedProps) {
  const { winner, myRole, players } = useGameRoomStore()

  const isWinner = winner === myRole
  const winnerName = winner ? players?.[winner]?.name : 'Unknown'

  return (
    <div className="flex flex-col items-center justify-center py-12 gap-8 animate-in fade-in zoom-in duration-500">
      <div className="relative">
        <div
          className={`absolute -inset-4 rounded-full blur-xl opacity-50 ${
            isWinner ? 'bg-neon-lime' : 'bg-red-500'
          }`}
        />
        {isWinner ? (
          <Trophy className="w-24 h-24 text-neon-lime relative z-10 drop-shadow-[0_0_15px_rgba(132,204,22,0.5)]" />
        ) : (
          <XCircle className="w-24 h-24 text-red-500 relative z-10 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
        )}
      </div>

      <div className="text-center space-y-2">
        <h2
          className={`text-4xl md:text-6xl font-orbitron font-bold tracking-wider ${
            isWinner ? 'text-neon-lime' : 'text-red-500'
          }`}
        >
          {isWinner ? 'VICTORY' : 'DEFEAT'}
        </h2>
        <p className="text-slate-400 font-spacemono uppercase tracking-widest">
          {isWinner ? 'Mission Accomplished' : 'Mission Failed'}
        </p>
      </div>

      <div className="bg-slate-950/50 border border-slate-800 rounded-lg p-6 w-full max-w-md text-center">
        <p className="text-sm text-slate-500 uppercase tracking-widest mb-2">Winner</p>
        <p className="text-2xl font-orbitron text-white">{winnerName}</p>
      </div>

      <div className="flex gap-4">
        <TacticalButton onClick={onLeave} variant="default" size="lg">
          Return to Base
        </TacticalButton>
      </div>
    </div>
  )
}
