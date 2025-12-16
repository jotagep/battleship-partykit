import { partyserverMiddleware } from 'hono-party'

import { BindingsEnv } from '../types/env'

export const partyMiddleware = partyserverMiddleware<{ Bindings: BindingsEnv }>({
  options: {
    onBeforeConnect: async (req) => {
      const cookie = req.headers.get('cookie') ?? ''

      const hasAuthToken =
        cookie.includes('better-auth.session_token=') || cookie.includes('better-auth.state=')

      if (!hasAuthToken) {
        return new Response('Unauthorized: Missing authentication token', { status: 401 })
      }

      return
    },
  },
})
