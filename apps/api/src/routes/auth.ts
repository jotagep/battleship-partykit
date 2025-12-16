import { Hono } from 'hono'

import { auth } from '../auth'
import { BindingsEnv } from '../types/env'

type AuthEnv = { Bindings: BindingsEnv }

const authRouter = new Hono<AuthEnv>()

authRouter.on(['GET', 'POST', 'OPTIONS'], '/*', (c) => auth(c.env).handler(c.req.raw))

export { authRouter }
