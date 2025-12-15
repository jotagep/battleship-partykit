'use client'

import { type Coordinate, type ShipId } from '@repo/shared/battleship'
import { Shield, Target } from 'lucide-react'

import { useGameRoomStore } from '@/lib/stores/gameStore'

import { Grid } from '../Grid'
import { ShipStatus } from '../ShipStatus'

import { GamePlayStatusBar } from './GamePlayStatusBar'

interface GamePlayPhaseProps {
  onFire: (at: Coordinate) => void
}

const calculateSunkShips = (shots: Array<{ result: { outcome: string; shipId?: ShipId } }>) => {
  return shots
    .filter((s) => s.result.outcome === 'sunk' && s.result.shipId)
    .map((s) => s.result.shipId as ShipId)
}

export function GamePlay({ onFire }: GamePlayPhaseProps) {
  const { deployedFleet, myShots, opponentShots, turn, myRole } = useGameRoomStore()

  const isMyTurn = turn === myRole

  const mySunkShips = calculateSunkShips(opponentShots)
  const opponentSunkShips = calculateSunkShips(myShots)

  return (
    <div className="flex flex-col gap-8">
      {/* Status Bar */}
      <GamePlayStatusBar myRole={myRole} isMyTurn={isMyTurn} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* My Fleet (Defensive) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-orbitron text-neon-cyan tracking-wider flex items-center gap-2">
              <Shield className="w-5 h-5" />
              YOUR FLEET
            </h3>
            <div className="text-xs font-spacemono text-slate-400">
              STATUS: <span className="text-neon-lime">OPERATIONAL</span>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-linear-to-r from-cyan-500/20 to-blue-500/20 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000" />
            <div className="relative bg-slate-950/80 p-1 rounded-lg border border-slate-800/50 backdrop-blur-sm">
              <Grid
                ships={deployedFleet || []}
                shots={opponentShots}
                interactive={false}
                size={10}
              />
            </div>
          </div>

          <ShipStatus sunkShips={mySunkShips} label="Fleet Status" />
        </div>

        {/* Radar (Offensive) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-orbitron text-red-500 tracking-wider flex items-center gap-2">
              <Target className="w-5 h-5" />
              RADAR SCREEN
            </h3>
            <div className="text-xs font-spacemono text-slate-400">
              TARGETING: <span className="text-red-500">LOCKED</span>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-linear-to-r from-red-500/20 to-orange-500/20 rounded-lg blur opacity-20 group-hover:opacity-40 transition duration-1000" />
            <div className="relative bg-slate-950/80 p-1 rounded-lg border border-slate-800/50 backdrop-blur-sm">
              {/* Radar Grid Overlay Effect */}
              <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden rounded-lg">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(239,68,68,0.1),transparent_70%)]" />
                <div className="absolute inset-[-50%] animate-[radar-spin_4s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,transparent_300deg,rgba(239,68,68,0.2)_360deg)]" />
              </div>

              <Grid
                shots={myShots}
                interactive={isMyTurn}
                onCellClick={(x, y) => {
                  if (!isMyTurn) return
                  // Check if already fired
                  if (myShots.some((s) => s.x === x && s.y === y)) return
                  onFire({ x, y })
                }}
                size={10}
              />
            </div>
          </div>

          <ShipStatus sunkShips={opponentSunkShips} label="Enemy Targets" align="right" />
        </div>
      </div>
    </div>
  )
}
