'use client'

import { useState } from 'react'
import { DEFAULT_SHIP_TEMPLATES, type ShipId } from '@repo/shared/battleship'
import { ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'

interface ShipStatusProps {
  sunkShips: ShipId[]
  label: string
  align?: 'left' | 'right'
}

export function ShipStatus({ sunkShips, label, align = 'left' }: ShipStatusProps) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="bg-slate-950/50 rounded-lg border border-slate-800 overflow-hidden transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'w-full flex items-center justify-between p-4 hover:bg-slate-900/50 transition-colors',
          align === 'right' && 'flex-row-reverse',
        )}
      >
        <h4 className="text-xs font-spacemono text-slate-400 uppercase tracking-widest">{label}</h4>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-slate-500 transition-transform duration-300',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      <div
        className={cn(
          'transition-all duration-300 ease-in-out overflow-hidden',
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <div className="p-4 pt-0 space-y-3">
          {DEFAULT_SHIP_TEMPLATES.map((ship) => {
            const isSunk = sunkShips.includes(ship.id)
            return (
              <div
                key={ship.id}
                className={cn(
                  'flex items-center gap-4 text-sm',
                  align === 'right' ? 'flex-row-reverse' : 'flex-row',
                )}
              >
                <span
                  className={cn(
                    'font-orbitron transition-all duration-500',
                    isSunk
                      ? 'text-red-500 line-through decoration-red-500/50 opacity-70'
                      : 'text-slate-300',
                  )}
                >
                  {ship.name}
                </span>
                <div className={cn('flex gap-1', align === 'right' && 'flex-row-reverse')}>
                  {Array.from({ length: ship.size }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-1.5 h-3 rounded-sm transition-all duration-500',
                        isSunk
                          ? 'bg-red-500/50 shadow-[0_0_5px_rgba(239,68,68,0.5)]'
                          : 'bg-cyan-500/20',
                      )}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
