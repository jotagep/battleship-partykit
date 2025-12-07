import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import eslintConfigPrettier from 'eslint-config-prettier'
import globals from 'globals'
import onlyWarn from 'eslint-plugin-only-warn'
import tseslint from 'typescript-eslint'

/**
 * ESLint config for Cloudflare Worker APIs (e.g. Hono).
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const cloudflareWorkerConfig = defineConfig([
  {
    ignores: ['dist/**', 'drizzle/**', '.wrangler/**', 'drizzle.config.ts', 'eslint.config.*'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintConfigPrettier,
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
    plugins: {
      onlyWarn,
    },
    rules: {
      '@typescript-eslint/require-await': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
])
