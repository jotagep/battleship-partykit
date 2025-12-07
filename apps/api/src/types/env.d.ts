import type { Battleship } from "../parties/battleship"

interface BindingsEnv {
	DB: D1Database
	AUTH_BASE_URL?: string
	AUTH_WEB_ORIGIN?: string
	BATTLESHIP_PARTY: DurableObjectNamespace<Battleship>
	BETTER_AUTH_SECRET: string
	GOOGLE_CLIENT_ID: string
	GOOGLE_CLIENT_SECRET: string
}

export { BindingsEnv }
