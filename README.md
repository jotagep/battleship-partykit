# Battleship (Partykit + Cloudflare Workers)

🛥️ Real-time Battleship built for fast, lightweight, globally distributed multiplayer play.

## What this is

- Backend: Cloudflare Workers + Hono
- Live sync: PartyKit WebSockets
- Monorepo: Turborepo with `web` (Next.js) + `api` (Workers/Partykit)
- Goal: crisp turn-based play with minimal latency

## Packages

- `apps/web`: Next.js client
- `apps/api`: Hono API on Cloudflare Workers (PartyKit server-side sync)
- `packages/shared`: shared types/utilities
- `packages/eslint-config`, `packages/typescript-config`: shared lint/TS configs

## Getting started

```sh
bun install

# Dev all apps
bun run dev

# Dev a single app
bun run dev --filter=web
bun run dev --filter=api
```

## Scripts (root)

- `bun run dev` – turbo dev for all packages
- `bun run lint` – lint via turbo
- `bun run format` – prettier write across repo
- `bun run check-types` – typecheck via turbo

## Why this stack

- Workers keep the backend globally close to players
- Hono keeps routes tiny and fast
- PartyKit gives real-time state sync without custom WebSocket plumbing
- Turborepo + shared configs = consistent DX# Sink the Fleet
