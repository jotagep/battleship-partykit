# Battleship (Partykit + Cloudflare Workers)

🛥️ Real-time Battleship built for fast, lightweight, globally distributed multiplayer play.

## What this is

- Backend: Cloudflare Workers + Hono
- Live sync: PartyKit WebSockets
- Monorepo: Turborepo with `web` (Next.js) + `api` (Workers)
- Goal: crisp turn-based play with minimal latency

## Packages

- `apps/web`: Next.js client
- `apps/api`: Hono API on Cloudflare Workers (PartyKit server-side sync)
- `packages/ui`: shared UI components
- `packages/eslint-config`, `packages/typescript-config`: shared lint/TS configs

## Getting started

```sh
bun install

# Dev all apps
bun run dev

# Dev a single app
cd apps/web && bun run dev
cd apps/api && bun run dev
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

🛥️ Real-time Battleship built for fast, lightweight, globally distributed multiplayer play.

## What this is

- Backend: Cloudflare Workers + Hono
- Live sync: PartyKit WebSockets
- Monorepo: Turborepo with `web` (Next.js) + `api` (Workers)
- Goal: crisp turn-based play with minimal latency

## Packages

- `apps/web`: Next.js client
- `apps/api`: Hono API on Cloudflare Workers (PartyKit server-side sync)
- `packages/ui`: shared UI components
- `packages/eslint-config`, `packages/typescript-config`: shared lint/TS configs

## Getting started

```sh
bun install

# Dev all apps
bun run dev

# Dev a single app
cd apps/web && bun run dev
cd apps/api && bun run dev
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
- Turborepo + shared configs = consistent DX# Turborepo starter

A monorepo starter template using Turborepo with Bun, TypeScript, ESLint, and Prettier.
