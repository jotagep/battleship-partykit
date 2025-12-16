import { Hono } from 'hono'

import { corsMiddleware } from './middleware/cors.middleware'
import { partyMiddleware } from './middleware/party.middleware'
import { authRouter } from './routes/auth'
import { gamesRouter } from './routes/games'
import { BindingsEnv } from './types/env'

type ApiEnv = { Bindings: BindingsEnv }

const app = new Hono<ApiEnv>()

app.use('*', corsMiddleware)

app.route('/games', gamesRouter)
app.route('/auth', authRouter)

app.use('/parties/*', partyMiddleware)

export default app
