import * as React from 'react'

import { cn } from '@/lib/utils'

interface GridProps {
  size?: number
  onCellClick?: (x: number, y: number) => void
}

export function Grid({ size = 10, onCellClick }: GridProps) {
  return (
    <div
      className="grid gap-1 bg-slate-900/50 p-2 rounded border border-slate-800"
      style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: size * size }).map((_, i) => {
        const x = i % size
        const y = Math.floor(i / size)
        return (
          <div
            key={`${x}-${y}`}
            onClick={() => onCellClick?.(x, y)}
            className={cn(
              'aspect-square border border-slate-800/50 hover:bg-cyan-500/20 transition-colors cursor-pointer',
            )}
          />
        )
      })}
    </div>
  )
}
