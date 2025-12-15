// Centralized success response handling for the application

/**
 * Success codes enum
 */
export enum SuccessCode {
  // Game operations (1xxx)
  GAME_CREATED = 1100,
  GAME_RETRIEVED = 1101,
  GAME_JOINED = 1102,
  GAME_UPDATED = 1103,
  GAME_DELETED = 1104,

  // General operations (2xxx)
  OPERATION_SUCCESS = 2000,
  RESOURCE_CREATED = 2001,
  RESOURCE_UPDATED = 2002,
  RESOURCE_DELETED = 2003,
}

/**
 * Success response interface
 */
export interface SuccessResponse<T = unknown> {
  success: true
  message: string
  code: SuccessCode
  data?: T
}

/**
 * Pre-defined success messages
 */
export const SuccessMessages: Record<SuccessCode, string> = {
  // Game operations
  [SuccessCode.GAME_CREATED]: 'Game created successfully',
  [SuccessCode.GAME_RETRIEVED]: 'Game retrieved successfully',
  [SuccessCode.GAME_JOINED]: 'Game joined successfully',
  [SuccessCode.GAME_UPDATED]: 'Game updated successfully',
  [SuccessCode.GAME_DELETED]: 'Game deleted successfully',

  // General operations
  [SuccessCode.OPERATION_SUCCESS]: 'Operation completed successfully',
  [SuccessCode.RESOURCE_CREATED]: 'Resource created successfully',
  [SuccessCode.RESOURCE_UPDATED]: 'Resource updated successfully',
  [SuccessCode.RESOURCE_DELETED]: 'Resource deleted successfully',
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T = unknown>(
  code: SuccessCode,
  data?: T,
): SuccessResponse<T> {
  return {
    success: true,
    message: SuccessMessages[code],
    code,
    ...(data && { data }),
  }
}

/**
 * Check if a response is a success response
 */
export function isSuccessResponse(response: unknown): response is SuccessResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    (response as Record<string, unknown>).success === true &&
    'message' in response &&
    'code' in response
  )
}
