import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { partyserverMiddleware } from 'hono-party'

import { Battleship } from './parties/battleship'
import { BindingsEnv } from './types/env'
import { auth } from './auth'

type ApiEnv = { Bindings: BindingsEnv }

const app = new Hono<ApiEnv>()

app.use(
  '*',
  cors({
    origin: 'http://localhost:3000', // tu frontend
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
)

app.get('/', (c) =>
  c.json({
    ok: true,
    partiesEndpoint: '/parties/battleship/:roomName',
  }),
)

app.get('/rooms/:roomName', (c) => {
  const roomName = c.req.param('roomName')
  const url = new URL(c.req.url)
  const wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:'
  const partyPath = `/parties/battleship/${roomName}`

  return c.json({
    room: roomName,
    websocket: `${wsProtocol}//${url.host}${partyPath}`,
    http: `${url.protocol}//${url.host}${partyPath}`,
  })
})

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

export { Battleship }
export default app
