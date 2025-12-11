'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { type Ship } from '@/lib/game-logic'

import { Grid } from './Grid'
import { ShipCard } from './ShipCard'

const AVAILABLE_SHIPS: Omit<Ship, 'position' | 'orientation' | 'hits'>[] = [
  { id: 'carrier', name: 'Carrier', size: 5 },
  { id: 'battleship', name: 'Battleship', size: 4 },
  { id: 'destroyer', name: 'Destroyer', size: 3 },
  { id: 'submarine', name: 'Submarine', size: 3 },
  { id: 'patrol-boat', name: 'Patrol Boat', size: 2 },
]

interface GamePreparationPhaseProps {
  onDeploy: (ships: Ship[]) => void
}

export function GamePreparationPhase({ onDeploy }: GamePreparationPhaseProps) {
  const [placedShips, setPlacedShips] = useState<Ship[]>([])
  const [selectedShipId, setSelectedShipId] = useState<string | null>(null)
  const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal')
  const [hoverPosition, setHoverPosition] = useState<{ x: number; y: number } | null>(null)

  const selectedShipTemplate = AVAILABLE_SHIPS.find((s) => s.id === selectedShipId)

  const previewShip: Ship | null =
    selectedShipTemplate && hoverPosition
      ? {
          ...selectedShipTemplate,
          position: hoverPosition,
          orientation,
          hits: 0,
        }
      : null

  const handleShipSelect = (id: string) => {
    if (placedShips.some((s) => s.id === id)) {
      // If already placed, remove it to re-place
      setPlacedShips((prev) => prev.filter((s) => s.id !== id))
    }
    setSelectedShipId(id)
  }

  const handleGridClick = (x: number, y: number) => {
    if (!selectedShipId || !selectedShipTemplate) return

    const newShip: Ship = {
      ...selectedShipTemplate,
      position: { x, y },
      orientation,
      hits: 0,
    }

    // Validate placement
    // Check boundaries
    if (orientation === 'horizontal') {
      if (x + newShip.size > 10) {
        toast.error('Ship out of bounds')
        return
      }
    } else {
      if (y + newShip.size > 10) {
        toast.error('Ship out of bounds')
        return
      }
    }

    // Check collisions
    const isCollision = placedShips.some((existing) => {
      if (!existing.position) return false
      // Simple bounding box check
      // Expand this logic if needed, but Grid.tsx also has logic.
      // Let's reuse the logic if possible or duplicate for now as it's simple.
      // Actually, let's just check if any cell overlaps.
      for (let i = 0; i < newShip.size; i++) {
        const cx = orientation === 'horizontal' ? x + i : x
        const cy = orientation === 'horizontal' ? y : y + i

        // Check against existing ship cells
        for (let j = 0; j < existing.size; j++) {
          const ex =
            existing.orientation === 'horizontal' ? existing.position.x + j : existing.position.x
          const ey =
            existing.orientation === 'horizontal' ? existing.position.y : existing.position.y + j
          if (cx === ex && cy === ey) return true
        }
      }
      return false
    })

    if (isCollision) {
      toast.error('Ship collision')
      return
    }

    setPlacedShips((prev) => [...prev, newShip])
    setSelectedShipId(null)
    setHoverPosition(null)
  }

  const handleRotate = () => {
    setOrientation((prev) => (prev === 'horizontal' ? 'vertical' : 'horizontal'))
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        handleRotate()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const allShipsPlaced = placedShips.length === AVAILABLE_SHIPS.length

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-xl font-orbitron text-neon-cyan tracking-widest">PREPARATION PHASE</h2>
        <p className="text-slate-400 font-spacemono text-sm">Place your ships</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Ship Dock */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-orbitron text-slate-300">SHIP DOCK</h3>
          </div>
          <div className="space-y-3">
            {AVAILABLE_SHIPS.map((ship) => {
              const isPlaced = placedShips.some((s) => s.id === ship.id)
              const isSelected = selectedShipId === ship.id
              return (
                <div key={ship.id} className={isPlaced ? 'opacity-20' : ''}>
                  <ShipCard
                    name={ship.name}
                    size={ship.size}
                    selected={isSelected}
                    onClick={() => handleShipSelect(ship.id)}
                  />
                </div>
              )
            })}
          </div>
          <div className="mt-4 text-center">
            <p className="text-xs font-spacemono text-slate-500">
              Press <span className="text-neon-cyan font-bold">R</span> to rotate ship
            </p>
          </div>
        </div>

        {/* Your Fleet */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-orbitron text-slate-300">YOUR FLEET</h3>
          </div>

          <Grid
            size={10}
            ships={placedShips}
            previewShip={previewShip}
            onCellClick={handleGridClick}
            onCellMouseEnter={(x, y) => setHoverPosition({ x, y })}
            onCellMouseLeave={() => setHoverPosition(null)}
          />

          <div className="flex justify-between items-center mt-6">
            <span className="font-spacemono text-slate-400 text-sm">
              SHIPS PLACED: {placedShips.length}/{AVAILABLE_SHIPS.length}
            </span>
            <button
              onClick={() => onDeploy(placedShips)}
              disabled={!allShipsPlaced}
              className="px-8 py-3 bg-neon-lime text-black font-orbitron font-bold tracking-wider hover:bg-lime-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(132,204,22,0.3)] disabled:shadow-none"
            >
              DEPLOY FLEET
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
