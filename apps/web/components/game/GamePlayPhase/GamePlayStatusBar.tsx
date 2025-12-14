import { Crosshair, Shield } from 'lucide-react'

import { useGameRoomStore } from '@/lib/stores/game-room-store'
import { cn } from '@/lib/utils'

interface GamePlayStatusBarProps {
  myRole: 'player1' | 'player2' | null
  isMyTurn: boolean
}

export function GamePlayStatusBar({ myRole, isMyTurn }: GamePlayStatusBarProps) {
  const { players } = useGameRoomStore()

  const myName = myRole ? players?.[myRole]?.name : 'Player'
  const opponentRole = myRole === 'player1' ? 'player2' : 'player1'
  const opponentName = players?.[opponentRole]?.name || 'Opponent'

  return (
    <div className="flex items-center justify-between bg-slate-950/50 p-2 rounded-lg border border-slate-800">
      <div
        className={cn(
          'flex items-center gap-4 px-4 py-2 rounded-lg transition-all duration-500 relative overflow-hidden',
          isMyTurn
            ? 'bg-neon-lime/5 border-l-2 border-neon-lime shadow-[inset_20px_0_20px_-20px_rgba(132,204,22,0.3)]'
            : 'opacity-50 border-l-2 border-transparent',
        )}
      >
        {isMyTurn && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-l-[8px] border-l-neon-lime ml-0.5" />
        )}
        <div className={cn('flex flex-col', isMyTurn && 'pl-2')}>
          <span className="text-xs text-slate-400 uppercase tracking-widest">Player</span>
          <span
            className={cn(
              'font-orbitron transition-colors',
              isMyTurn ? 'text-neon-lime' : 'text-slate-500',
            )}
          >
            {myName}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isMyTurn ? (
          <div className="flex items-center gap-2 px-4 py-2 bg-neon-lime/10 border border-neon-lime/50 rounded text-neon-lime animate-pulse">
            <Crosshair className="w-4 h-4" />
            <span className="font-spacemono font-bold tracking-wider">YOUR TURN</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/50 rounded text-red-500">
            <Shield className="w-4 h-4" />
            <span className="font-spacemono font-bold tracking-wider">OPPONENT TURN</span>
          </div>
        )}
      </div>

      <div
        className={cn(
          'flex items-center gap-4 text-right px-4 py-2 rounded-lg transition-all duration-500 relative overflow-hidden',
          !isMyTurn
            ? 'bg-red-500/5 border-r-2 border-red-500 shadow-[inset_-20px_0_20px_-20px_rgba(239,68,68,0.3)]'
            : 'opacity-50 border-r-2 border-transparent',
        )}
      >
        <div className={cn('flex flex-col', !isMyTurn && 'pr-2')}>
          <span className="text-xs text-slate-400 uppercase tracking-widest">Opponent</span>
          <span
            className={cn(
              'font-orbitron transition-colors',
              !isMyTurn ? 'text-red-500' : 'text-slate-500',
            )}
          >
            {opponentName}
          </span>
        </div>
        {!isMyTurn && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent border-r-[8px] border-r-red-500 mr-0.5" />
        )}
      </div>
    </div>
  )
}
