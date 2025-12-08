import { createAuthClient } from 'better-auth/react'

type AuthClient = ReturnType<typeof createAuthClient>

export const authClient: AuthClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:8787/auth',
  fetchOptions: {
    credentials: 'include',
  },
})
