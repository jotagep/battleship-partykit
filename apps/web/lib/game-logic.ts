export type Coordinate = { x: number; y: number }

export interface Ship {
  id: string
  name: string
  size: number
  position?: Coordinate
  orientation?: 'horizontal' | 'vertical'
  hits: number
}

export function isValidPlacement(
  ship: Ship,
  position: Coordinate,
  orientation: 'horizontal' | 'vertical',
  existingShips: Ship[],
  gridSize: number = 10,
): boolean {
  // Check boundaries
  if (orientation === 'horizontal') {
    if (position.x + ship.size > gridSize) return false
  } else {
    if (position.y + ship.size > gridSize) return false
  }

  // Check collisions
  // ... implementation needed
  return true
}
