import { defineConfig } from 'eslint/config'
import globals from 'globals'
import tseslint from 'typescript-eslint'
import { config as baseConfig } from './base.js'

/**
 * ESLint config for Cloudflare Worker APIs (e.g. Hono).
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const cloudflareWorkerConfig = defineConfig([
  ...baseConfig,
  ...tseslint.configs.recommendedTypeChecked,
  {
    ignores: ['dist/**', 'drizzle/**', '.wrangler/**', 'drizzle.config.ts', 'eslint.config.*'],
  },
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        allowDefaultProject: true,
      },
      globals: {
        ...globals.serviceworker,
      },
    },
    rules: {
      '@typescript-eslint/require-await': 'off',
    },
  },
])
