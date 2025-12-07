import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { drizzle } from "drizzle-orm/d1"
import { BindingsEnv } from "./types/env"
import { account, session, user, verification } from "./db/schema"

export const auth = (env: BindingsEnv) =>
	betterAuth({
		appName: "Battleship",
		basePath: "/auth",
		baseURL: env.AUTH_BASE_URL ?? "http://localhost:8787",
		secret: env.BETTER_AUTH_SECRET,
		trustedOrigins: ["http://localhost:3000"],
		database: drizzleAdapter(drizzle(env.DB), {
			provider: "sqlite",
			schema: {
				user,
				account,
				session,
				verification,
			},
		}),
		socialProviders: {
			google: {
				prompt: "select_account",
				clientId: env.GOOGLE_CLIENT_ID,
				clientSecret: env.GOOGLE_CLIENT_SECRET,
			},
		},
	})
