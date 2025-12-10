import { drizzle } from 'drizzle-orm/d1'

import * as schema from '../db/schema'
import type { BindingsEnv } from '../types/env'

export function getDB(env: BindingsEnv) {
  return drizzle(env.DB, { schema })
}
