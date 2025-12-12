import * as React from 'react'
import {
  coordinateKey,
  getPlacementCells,
  type ShipPlacement,
  validateFleetPlacement,
} from '@repo/shared/battleship'

import { cn } from '@/lib/utils'

interface GridProps {
  size?: number
  ships?: ShipPlacement[]
  previewShip?: ShipPlacement | null
  onCellClick?: (x: number, y: number) => void
  onCellMouseEnter?: (x: number, y: number) => void
  onCellMouseLeave?: () => void
}

export function Grid({
  size = 10,
  ships = [],
  previewShip,
  onCellClick,
  onCellMouseEnter,
  onCellMouseLeave,
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

  return (
    <div
      className="grid gap-1 bg-slate-900/50 p-2 rounded border border-slate-800 select-none"
      style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      onMouseLeave={onCellMouseLeave}
    >
      {Array.from({ length: size * size }).map((_, i) => {
        const x = i % size
        const y = Math.floor(i / size)
        const cellOccupied = isOccupied(x, y)
        const preview = isPreview(x, y)
        const valid = preview ? !!previewValid : true

        return (
          <div
            key={`${x}-${y}`}
            onClick={() => onCellClick?.(x, y)}
            onMouseEnter={() => onCellMouseEnter?.(x, y)}
            className={cn(
              'aspect-square border border-slate-800/50 transition-colors cursor-pointer',
              cellOccupied &&
                'bg-cyan-500/50 border-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.2)]',
              preview && valid && 'bg-neon-lime/30 border-neon-lime/50',
              preview && !valid && 'bg-red-500/30 border-red-500/50',
              !cellOccupied && !preview && 'hover:bg-cyan-500/20',
            )}
          />
        )
      })}
    </div>
  )
}
