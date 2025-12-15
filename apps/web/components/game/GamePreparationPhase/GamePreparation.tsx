'use client'

import { useEffect, useState } from 'react'
import {
  BOARD_SIZE,
  type Coordinate,
  DEFAULT_SHIP_TEMPLATES,
  type FleetPlacement,
  type Orientation,
  type ShipId,
  type ShipPlacement,
  validateFleetPlacement,
} from '@repo/shared/battleship'
import { toast } from 'sonner'

import { useGameRoomStore } from '@/lib/stores/gameStore'

import { Grid } from '../Grid'
import { ShipCard } from '../ShipCard'

import { GameFleetDeployed } from './GameFleetDeployed'

interface GamePreparationPhaseProps {
  onDeploy: (fleet: FleetPlacement) => void
}

export function GamePreparation({ onDeploy }: GamePreparationPhaseProps) {
  const { deployedFleet } = useGameRoomStore()
  const [placedShips, setPlacedShips] = useState<ShipPlacement[]>([])
  const [selectedShipId, setSelectedShipId] = useState<ShipId | null>(null)
  const [orientation, setOrientation] = useState<Orientation>('horizontal')
  const [hoverPosition, setHoverPosition] = useState<Coordinate | null>(null)

  const selectedShipTemplate = DEFAULT_SHIP_TEMPLATES.find((s) => s.id === selectedShipId)

  const previewShip: ShipPlacement | null =
    selectedShipTemplate && hoverPosition
      ? {
          id: selectedShipTemplate.id,
          position: hoverPosition,
          orientation,
        }
      : null

  const handleShipSelect = (id: ShipId) => {
    if (placedShips.some((s) => s.id === id)) {
      // If already placed, remove it to re-place
      setPlacedShips((prev) => prev.filter((s) => s.id !== id))
    }
    setSelectedShipId(id)
  }

  const handleGridClick = (x: number, y: number) => {
    if (!selectedShipId || !selectedShipTemplate) return

    const newShip: ShipPlacement = {
      id: selectedShipId,
      position: { x, y },
      orientation,
    }

    const validation = validateFleetPlacement([...placedShips, newShip], {
      boardSize: BOARD_SIZE,
      requireDefaultFleet: false,
    })

    if (!validation.ok) {
      if (validation.code === 'out_of_bounds') toast.error('Ship out of bounds')
      else if (validation.code === 'overlap') toast.error('Ship collision')
      else toast.error(validation.message)
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

  if (deployedFleet) {
    return <GameFleetDeployed />
  }

  const allShipsPlaced = placedShips.length === DEFAULT_SHIP_TEMPLATES.length

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
            {DEFAULT_SHIP_TEMPLATES.map((ship) => {
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
              SHIPS PLACED: {placedShips.length}/{DEFAULT_SHIP_TEMPLATES.length}
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
