import { createMiddleware } from 'hono/factory'

import { auth } from '../auth'
import { BindingsEnv, VariablesEnv } from '../types/env'

const authMiddleware = createMiddleware<{ Bindings: BindingsEnv; Variables: VariablesEnv }>(
  async (c, next) => {
    const session = await auth(c.env).api.getSession({
      headers: { cookie: c.req.header('Cookie') ?? '' },
    })

    if (!session) {
      return c.json({ error: 'Unauthorized' }, 401)
    }

    c.set('USER', session.user as VariablesEnv['USER'])

    return next()
  },
)

export { authMiddleware }
