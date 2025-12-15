import * as React from 'react'

import { cn } from '@/lib/utils'

interface ShipCardProps {
  name: string
  size: number
  selected?: boolean
  onClick?: () => void
}

export function ShipCard({ name, size, selected, onClick }: ShipCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'p-4 border rounded cursor-pointer transition-all',
        selected
          ? 'border-cyan-500 bg-cyan-500/10 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
          : 'border-slate-800 bg-slate-900/50 hover:border-slate-600',
      )}
    >
      <div className="font-orbitron text-sm text-cyan-400 mb-2">{name}</div>
      <div className="flex gap-1">
        {Array.from({ length: size }).map((_, i) => (
          <div key={i} className="w-4 h-4 bg-slate-700 rounded-sm" />
        ))}
      </div>
    </div>
  )
}
