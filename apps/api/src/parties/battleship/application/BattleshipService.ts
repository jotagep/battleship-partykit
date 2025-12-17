import {
  applyShotToFleet,
  type Coordinate,
  type FleetPlacement,
  type GameRolePlayer,
  isFleetSunk,
  isWithinBoard,
  type ShotResult,
  toInitialFleetState,
  validateFleetPlacement,
} from '@repo/shared/battleship'

import { type User } from '../../../db/schema'
import { type GameState } from '../domain/GameState'
import { type GameRepository } from '../persistence/GameRepository'
import { type GameStateStore } from '../persistence/GameStateStore'

type DeployResult = { ok: true; gameStarted: boolean } | { ok: false; error: string }

type FireResult =
  | {
      ok: true
      result: ShotResult
      nextTurn: GameRolePlayer
      isGameOver: boolean
    }
  | { ok: false; error: string }

type SurrenderResult = { ok: true; winner: GameRolePlayer } | { ok: false; error: string }

export class BattleshipService {
  public game: GameState = {
    phase: 'preparing',
    turn: 'player1',
    players: {
      player1: undefined,
      player2: undefined,
    },
  }

  constructor(
    private readonly gameId: string,
    private readonly store: GameStateStore,
    private readonly repo: GameRepository,
  ) {}

  async load() {
    const state = this.store.load()
    if (state) {
      this.game = state
    }
  }

  async addPlayer(role: GameRolePlayer, user: User) {
    if (!this.game.players[role]) {
      this.game.players[role] = {
        user,
        shotsFired: [],
      }
    } else {
      this.game.players[role].user = user
    }
  }

  async removePlayer(role: GameRolePlayer) {
    if (this.game.phase === 'preparing' && role === 'player2') {
      delete this.game.players[role]
      await this.repo.setPlayer2(this.gameId, null)
    }
  }

  async deploy(role: GameRolePlayer, fleet: FleetPlacement): Promise<DeployResult> {
    const playerState = this.game.players[role]
    if (!playerState) return { ok: false, error: 'Player not found' }

    const validation = validateFleetPlacement(fleet)
    if (!validation.ok) {
      return { ok: false, error: `Invalid fleet: ${validation.message}` }
    }

    playerState.fleet = toInitialFleetState(fleet)

    const bothReady = Object.values(this.game.players).every((p) => p?.fleet !== undefined)
    let gameStarted = false

    if (bothReady) {
      this.game.turn = Math.random() < 0.5 ? 'player1' : 'player2'
      this.game.phase = 'playing'
      gameStarted = true

      await this.repo.updateStatus(this.gameId, 'playing')
    }

    this.store.save(this.game)

    return { ok: true, gameStarted }
  }

  async fire(role: GameRolePlayer, at: Coordinate): Promise<FireResult> {
    if (this.game.phase !== 'playing') {
      return { ok: false, error: 'Game is not in playing phase' }
    }

    if (role !== this.game.turn) {
      return { ok: false, error: "It's not your turn" }
    }

    if (!isWithinBoard(at)) {
      return { ok: false, error: 'Invalid coordinate' }
    }

    const playerState = this.game.players[role]
    if (!playerState) return { ok: false, error: 'Player not found' }

    const alreadyFired = playerState.shotsFired?.some((c) => c.x === at.x && c.y === at.y)
    if (alreadyFired) {
      return { ok: false, error: 'Already fired at this coordinate' }
    }

    const opponentRole: GameRolePlayer = role === 'player1' ? 'player2' : 'player1'
    const opponent = this.game.players[opponentRole]

    if (!opponent?.fleet) {
      return { ok: false, error: 'Opponent fleet not found' }
    }

    if (!playerState.shotsFired) {
      playerState.shotsFired = []
    }
    playerState.shotsFired.push(at)

    const { fleet: updatedFleet, result } = applyShotToFleet(opponent.fleet, at)
    opponent.fleet = updatedFleet

    const isGameOver = isFleetSunk(opponent.fleet)
    this.game.turn = opponentRole

    if (isGameOver) {
      this.game.winner = role
      this.game.phase = 'finished'
      await this.repo.updateStatus(this.gameId, 'finished', playerState.user.id)
      this.store.clear()
    } else {
      this.store.save(this.game)
    }

    return { ok: true, result, nextTurn: opponentRole, isGameOver }
  }

  async surrender(role: GameRolePlayer): Promise<SurrenderResult> {
    if (this.game.phase !== 'playing') {
      return { ok: false, error: 'Game is not in playing phase' }
    }

    const opponentRole = role === 'player1' ? 'player2' : 'player1'
    const opponent = this.game.players[opponentRole]

    if (!opponent) {
      return { ok: false, error: 'Opponent not found' }
    }

    this.game.winner = opponentRole
    this.game.phase = 'finished'

    await this.repo.updateStatus(this.gameId, 'finished', opponent?.user.id)
    this.store.clear()

    return { ok: true, winner: opponentRole }
  }
}
