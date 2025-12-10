// Centralized error handling for the application

/**
 * Error codes enum
 */
export enum ErrorCode {
  // Game errors (1xxx)
  GAME_NOT_FOUND = 1000,
  GAME_ALREADY_FULL = 1001,
  GAME_NOT_WAITING = 1002,
  GAME_INVALID_ACCESS_CODE = 1003,
  GAME_INVALID_STATUS = 1004,

  // Validation errors (2xxx)
  VALIDATION_MISSING_FIELD = 2000,
  VALIDATION_INVALID_FORMAT = 2001,

  // Auth errors (3xxx)
  AUTH_UNAUTHORIZED = 3000,
  AUTH_FORBIDDEN = 3001,
  AUTH_TOKEN_EXPIRED = 3002,

  // Server errors (5xxx)
  SERVER_INTERNAL_ERROR = 5000,
  SERVER_DATABASE_ERROR = 5001,
}

/**
 * Error response interface
 */
export interface ErrorResponse {
  error: string
  code: ErrorCode
  details?: string
}

/**
 * Pre-defined error messages
 */
export const ErrorMessages: Record<ErrorCode, string> = {
  // Game errors
  [ErrorCode.GAME_NOT_FOUND]: 'Game not found',
  [ErrorCode.GAME_ALREADY_FULL]: 'Game already has a second player',
  [ErrorCode.GAME_NOT_WAITING]: 'Game is not in waiting status',
  [ErrorCode.GAME_INVALID_ACCESS_CODE]: 'Invalid access code',
  [ErrorCode.GAME_INVALID_STATUS]: 'Invalid game status',

  // Validation errors
  [ErrorCode.VALIDATION_MISSING_FIELD]: 'Required field is missing',
  [ErrorCode.VALIDATION_INVALID_FORMAT]: 'Invalid format',

  // Auth errors
  [ErrorCode.AUTH_UNAUTHORIZED]: 'Unauthorized',
  [ErrorCode.AUTH_FORBIDDEN]: 'Forbidden',
  [ErrorCode.AUTH_TOKEN_EXPIRED]: 'Token expired',

  // Server errors
  [ErrorCode.SERVER_INTERNAL_ERROR]: 'Internal server error',
  [ErrorCode.SERVER_DATABASE_ERROR]: 'Database error',
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(code: ErrorCode, details?: string): ErrorResponse {
  return {
    error: ErrorMessages[code],
    code,
    ...(details && { details }),
  }
}

/**
 * Check if a response is an error
 */
export function isErrorResponse(response: unknown): response is ErrorResponse {
  return (
    typeof response === 'object' && response !== null && 'error' in response && 'code' in response
  )
}
