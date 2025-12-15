import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { partyserverMiddleware } from 'hono-party'

import { gamesRouter } from './routes/games'
import { BindingsEnv } from './types/env'
import { auth } from './auth'

type ApiEnv = { Bindings: BindingsEnv }

const app = new Hono<ApiEnv>()

app.use('*', async (c, next) => {
  const corsMiddleware = cors({
    origin: c.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
    allowMethods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  return corsMiddleware(c, next)
})

// Games routes
app.route('/games', gamesRouter)

// Better Auth endpoints (Google OAuth etc.)
app.on(['GET', 'POST', 'OPTIONS'], '/auth/*', (c) => auth(c.env).handler(c.req.raw))

// Hand off PartyServer traffic (websocket + HTTP) to the Battleship party.
app.use(
  '/parties/*',
  partyserverMiddleware<ApiEnv>({
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
  }),
)

export default app
