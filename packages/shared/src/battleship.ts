export const BOARD_SIZE = 10 as const

export type GamePhase = 'preparing' | 'playing' | 'finished'
export type GameRolePlayer = 'player1' | 'player2'

export type Coordinate = { x: number; y: number }
export type Orientation = 'horizontal' | 'vertical'

export const DEFAULT_SHIP_TEMPLATES = [
  { id: 'carrier', name: 'Carrier', size: 5 },
  { id: 'battleship', name: 'Battleship', size: 4 },
  { id: 'destroyer', name: 'Destroyer', size: 3 },
  { id: 'submarine', name: 'Submarine', size: 3 },
  { id: 'patrol-boat', name: 'Patrol Boat', size: 2 },
] as const

export type ShipId = (typeof DEFAULT_SHIP_TEMPLATES)[number]['id']
export type ShipTemplate = (typeof DEFAULT_SHIP_TEMPLATES)[number]

export interface ShipPlacement {
  id: ShipId
  position: Coordinate
  orientation: Orientation
}

/**
 * Server-side fleet state: we keep per-cell hits to prevent double-counting.
 * Sizes/names are derived from templates by `id`.
 */
export interface FleetShipState extends ShipPlacement {
  hits: Coordinate[]
}

export type FleetPlacement = ShipPlacement[]
export type FleetState = FleetShipState[]

export type FleetValidationErrorCode =
  | 'invalid_coordinate'
  | 'unknown_ship'
  | 'duplicate_ship'
  | 'wrong_fleet_size'
  | 'out_of_bounds'
  | 'overlap'

export type FleetValidationResult =
  | { ok: true }
  | {
      ok: false
      code: FleetValidationErrorCode
      message: string
    }

export function isCoordinate(value: unknown): value is Coordinate {
  return (
    typeof value === 'object' &&
    value !== null &&
    'x' in value &&
    'y' in value &&
    typeof (value as Record<string, unknown>).x === 'number' &&
    typeof (value as Record<string, unknown>).y === 'number' &&
    Number.isInteger((value as Record<string, unknown>).x) &&
    Number.isInteger((value as Record<string, unknown>).y)
  )
}

export function coordinateKey(c: Coordinate): string {
  return `${c.x},${c.y}`
}

export function sameCoordinate(a: Coordinate, b: Coordinate): boolean {
  return a.x === b.x && a.y === b.y
}

export function getShipTemplate(id: ShipId): ShipTemplate {
  const template = DEFAULT_SHIP_TEMPLATES.find((t) => t.id === id)
  // `id` is ShipId, so this is only defensive for runtime.
  if (!template) throw new Error(`Unknown ship id: ${id}`)
  return template
}

export function getShipSize(id: ShipId): number {
  return getShipTemplate(id).size
}

export function getPlacementCells(
  placement: ShipPlacement,
  _opts: { boardSize?: number } = {},
): Coordinate[] {
  const size = getShipSize(placement.id)
  const { x, y } = placement.position
  const cells: Coordinate[] = []

  for (let i = 0; i < size; i++) {
    const cx = placement.orientation === 'horizontal' ? x + i : x
    const cy = placement.orientation === 'horizontal' ? y : y + i
    cells.push({ x: cx, y: cy })
  }

  return cells
}

export function isWithinBoard(c: Coordinate, boardSize: number = BOARD_SIZE): boolean {
  return c.x >= 0 && c.y >= 0 && c.x < boardSize && c.y < boardSize
}

export function validateFleetPlacement(
  fleet: unknown,
  opts: { boardSize?: number; requireDefaultFleet?: boolean } = {},
): FleetValidationResult {
  const boardSize = opts.boardSize ?? BOARD_SIZE
  const requireDefaultFleet = opts.requireDefaultFleet ?? true

  if (!Array.isArray(fleet)) {
    return { ok: false, code: 'wrong_fleet_size', message: 'Fleet must be an array' }
  }

  if (requireDefaultFleet && fleet.length !== DEFAULT_SHIP_TEMPLATES.length) {
    return {
      ok: false,
      code: 'wrong_fleet_size',
      message: `Fleet must have ${DEFAULT_SHIP_TEMPLATES.length} ships`,
    }
  }

  const seenIds = new Set<string>()
  const occupied = new Set<string>()

  for (const raw of fleet) {
    if (typeof raw !== 'object' || raw === null) {
      return { ok: false, code: 'invalid_coordinate', message: 'Invalid ship placement' }
    }

    const record = raw as Record<string, unknown>
    const id = record.id as string
    const position = record.position
    const orientation = record.orientation

    const known = DEFAULT_SHIP_TEMPLATES.some((t) => t.id === id)
    if (!known) {
      return { ok: false, code: 'unknown_ship', message: `Unknown ship id: ${id}` }
    }

    if (seenIds.has(id)) {
      return { ok: false, code: 'duplicate_ship', message: `Duplicate ship id: ${id}` }
    }
    seenIds.add(id)

    if (!isCoordinate(position)) {
      return { ok: false, code: 'invalid_coordinate', message: `Invalid position for ship ${id}` }
    }

    if (orientation !== 'horizontal' && orientation !== 'vertical') {
      return {
        ok: false,
        code: 'invalid_coordinate',
        message: `Invalid orientation for ship ${id}`,
      }
    }

    const placement: ShipPlacement = { id: id as ShipId, position, orientation }
    const cells = getPlacementCells(placement)

    for (const cell of cells) {
      if (!isWithinBoard(cell, boardSize)) {
        return { ok: false, code: 'out_of_bounds', message: `Ship ${id} is out of bounds` }
      }

      const key = coordinateKey(cell)
      if (occupied.has(key)) {
        return { ok: false, code: 'overlap', message: `Ship ${id} overlaps another ship` }
      }
      occupied.add(key)
    }
  }

  if (requireDefaultFleet) {
    for (const t of DEFAULT_SHIP_TEMPLATES) {
      if (!seenIds.has(t.id)) {
        return {
          ok: false,
          code: 'wrong_fleet_size',
          message: `Missing ship id: ${t.id}`,
        }
      }
    }
  }

  return { ok: true }
}

export function toInitialFleetState(fleet: FleetPlacement): FleetState {
  return fleet.map((s) => ({ ...s, hits: [] }))
}

export type ShotOutcome = 'miss' | 'hit' | 'sunk'

export interface ShotResult {
  outcome: ShotOutcome
  shipId?: ShipId
}

export function applyShotToFleet(
  fleet: FleetState,
  shot: Coordinate,
  opts: { boardSize?: number } = {},
): { fleet: FleetState; result: ShotResult } {
  const boardSize = opts.boardSize ?? BOARD_SIZE

  if (!isWithinBoard(shot, boardSize)) {
    return { fleet, result: { outcome: 'miss' } }
  }

  // Find which ship (if any) occupies the cell.
  for (const ship of fleet) {
    const cells = getPlacementCells(ship)
    const isHitCell = cells.some((c) => sameCoordinate(c, shot))
    if (!isHitCell) continue

    // Idempotent: if already recorded, keep state.
    const alreadyHit = ship.hits.some((h) => sameCoordinate(h, shot))
    if (alreadyHit) {
      const sunk = ship.hits.length >= getShipSize(ship.id)
      return { fleet, result: { outcome: sunk ? 'sunk' : 'hit', shipId: ship.id } }
    }

    const nextFleet = fleet.map((s) => (s.id === ship.id ? { ...s, hits: [...s.hits, shot] } : s))

    const nextShip = nextFleet.find((s) => s.id === ship.id)!
    const sunk = nextShip.hits.length >= getShipSize(nextShip.id)

    return { fleet: nextFleet, result: { outcome: sunk ? 'sunk' : 'hit', shipId: ship.id } }
  }

  return { fleet, result: { outcome: 'miss' } }
}

export function isFleetSunk(fleet: FleetState): boolean {
  return fleet.every((s) => s.hits.length >= getShipSize(s.id))
}
