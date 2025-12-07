import { defineConfig } from 'eslint/config'

import { cloudflareWorkerConfig } from '@repo/eslint-config/cloudflare-worker'
import { config as baseConfig } from '@repo/eslint-config/base'
import { nextJsConfig } from '@repo/eslint-config/next-js'

const scopeTo = (configs, files) => configs.map((cfg) => ({ ...cfg, files }))

export default defineConfig([
  { ignores: ['**/node_modules/**', '**/dist/**', '**/.wrangler/**'] },
  ...scopeTo(nextJsConfig, ['apps/web/**']),
  ...scopeTo(cloudflareWorkerConfig, ['apps/api/**']),
  ...scopeTo(baseConfig, ['packages/**']),
])
