import { createAuthClient } from 'better-auth/react'

import { API_BASE_URL } from '@/config'

type AuthClient = ReturnType<typeof createAuthClient>

export const authClient: AuthClient = createAuthClient({
  baseURL: `${API_BASE_URL}/auth`,
  fetchOptions: {
    credentials: 'include',
  },
})
