import * as React from 'react'

import { type Ship } from '@/lib/game-logic'
import { cn } from '@/lib/utils'

interface GridProps {
  size?: number
  ships?: Ship[]
  previewShip?: Ship | null
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
  const isOccupied = (x: number, y: number, shipList: Ship[]) => {
    return shipList.some((ship) => {
      if (!ship.position) return false
      const { x: sx, y: sy } = ship.position
      if (ship.orientation === 'horizontal') {
        return y === sy && x >= sx && x < sx + ship.size
      }
      return x === sx && y >= sy && y < sy + ship.size
    })
  }

  const isPreview = (x: number, y: number) => {
    if (!previewShip || !previewShip.position) return false
    return isOccupied(x, y, [previewShip])
  }

  const isValidPreview = () => {
    if (!previewShip || !previewShip.position) return false
    // Check boundaries
    if (previewShip.orientation === 'horizontal') {
      if (previewShip.position.x + previewShip.size > size) return false
    } else {
      if (previewShip.position.y + previewShip.size > size) return false
    }
    // Check collision with existing ships
    // We need to check all cells the preview ship would occupy
    for (let i = 0; i < previewShip.size; i++) {
      const cx =
        previewShip.orientation === 'horizontal'
          ? previewShip.position.x + i
          : previewShip.position.x
      const cy =
        previewShip.orientation === 'horizontal'
          ? previewShip.position.y
          : previewShip.position.y + i
      if (isOccupied(cx, cy, ships)) return false
    }
    return true
  }

  return (
    <div
      className="grid gap-1 bg-slate-900/50 p-2 rounded border border-slate-800 select-none"
      style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
      onMouseLeave={onCellMouseLeave}
    >
      {Array.from({ length: size * size }).map((_, i) => {
        const x = i % size
        const y = Math.floor(i / size)
        const occupied = isOccupied(x, y, ships)
        const preview = isPreview(x, y)
        const valid = preview ? isValidPreview() : true

        return (
          <div
            key={`${x}-${y}`}
            onClick={() => onCellClick?.(x, y)}
            onMouseEnter={() => onCellMouseEnter?.(x, y)}
            className={cn(
              'aspect-square border border-slate-800/50 transition-colors cursor-pointer',
              occupied &&
                'bg-cyan-500/50 border-cyan-500/50 shadow-[0_0_10px_rgba(34,211,238,0.2)]',
              preview && valid && 'bg-neon-lime/30 border-neon-lime/50',
              preview && !valid && 'bg-red-500/30 border-red-500/50',
              !occupied && !preview && 'hover:bg-cyan-500/20',
            )}
          />
        )
      })}
    </div>
  )
}
