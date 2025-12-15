import * as React from 'react'
import {
  coordinateKey,
  getPlacementCells,
  type ShipPlacement,
  type ShotResult,
  validateFleetPlacement,
} from '@repo/shared/battleship'

import { cn } from '@/lib/utils'

export interface GridShot {
  x: number
  y: number
  result: ShotResult
}

interface GridProps {
  size?: number
  ships?: ShipPlacement[]
  shots?: GridShot[]
  previewShip?: ShipPlacement | null
  onCellClick?: (x: number, y: number) => void
  onCellMouseEnter?: (x: number, y: number) => void
  onCellMouseLeave?: () => void
  interactive?: boolean
}

export function Grid({
  size = 10,
  ships = [],
  shots = [],
  previewShip,
  onCellClick,
  onCellMouseEnter,
  onCellMouseLeave,
  interactive = true,
}: GridProps) {
  const occupied = new Set<string>()
  for (const ship of ships) {
    for (const cell of getPlacementCells(ship)) {
      occupied.add(coordinateKey(cell))
    }
  }

  const previewCells = previewShip ? getPlacementCells(previewShip) : []
  const previewSet = new Set(previewCells.map((c) => coordinateKey(c)))
  const previewValid =
    previewShip &&
    validateFleetPlacement([...ships, previewShip], { boardSize: size, requireDefaultFleet: false })
      .ok

  const isOccupied = (x: number, y: number) => occupied.has(`${x},${y}`)
  const isPreview = (x: number, y: number) => previewSet.has(`${x},${y}`)
  const getShot = (x: number, y: number) => shots.find((s) => s.x === x && s.y === y)

  return (
    <div
      className="grid gap-1 bg-slate-900/50 p-2 rounded border border-slate-800 select-none relative"
      style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      onMouseLeave={onCellMouseLeave}
    >
      <div className="absolute inset-0 pointer-events-none opacity-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[10%_10%]" />

      {Array.from({ length: size * size }).map((_, i) => {
        const x = i % size
        const y = Math.floor(i / size)
        const cellOccupied = isOccupied(x, y)
        const preview = isPreview(x, y)
        const valid = preview ? !!previewValid : true
        const shot = getShot(x, y)

        return (
          <div
            key={`${x}-${y}`}
            onClick={() => interactive && onCellClick?.(x, y)}
            onMouseEnter={() => interactive && onCellMouseEnter?.(x, y)}
            className={cn(
              'aspect-square border border-slate-800/50 transition-all duration-300 relative overflow-hidden',
              interactive && 'cursor-pointer',
              cellOccupied &&
                !shot &&
                'bg-cyan-500/30 border-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.2)]',
              preview && valid && 'bg-neon-lime/30 border-neon-lime/50',
              preview && !valid && 'bg-red-500/30 border-red-500/50',
              interactive && !cellOccupied && !preview && !shot && 'hover:bg-cyan-500/20',
              shot?.result.outcome === 'miss' && 'bg-slate-700/50',
              (shot?.result.outcome === 'hit' || shot?.result.outcome === 'sunk') &&
                'bg-red-500/40 border-red-500/60 shadow-[inset_0_0_20px_rgba(239,68,68,0.4)]',
            )}
          >
            {shot?.result.outcome === 'miss' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-slate-400/50" />
              </div>
            )}
            {(shot?.result.outcome === 'hit' || shot?.result.outcome === 'sunk') && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full animate-pulse bg-red-500/20" />
                <div className="absolute w-3 h-3 rotate-45 bg-red-500 shadow-[0_0_10px_#ef4444]" />
                <div className="absolute w-3 h-3 -rotate-45 bg-red-500 shadow-[0_0_10px_#ef4444]" />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
