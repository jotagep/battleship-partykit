export class GameError extends Error {
  constructor(
    message: string,
    public code?: number,
  ) {
    super(message)
    this.name = 'GameError'
  }
}
