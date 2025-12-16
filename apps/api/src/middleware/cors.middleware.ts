import { cors } from 'hono/cors'
import { createMiddleware } from 'hono/factory'

import { BindingsEnv } from '../types/env'

const corsMiddleware = createMiddleware<{ Bindings: BindingsEnv }>(async (c, next) => {
  const corsHandler = cors({
    origin: c.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
    allowMethods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })

  return corsHandler(c, next)
})

export { corsMiddleware }
