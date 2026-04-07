import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },

  // ── Import layer rules ──────────────────────────────────────────────────
  // types/ : 아무것도 import 안 함
  {
    files: ['src/types/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@/constants*', '@/lib*', '@/store*', '@/hooks*', '@/components*', '@/workers*'],
          message: 'types/ 는 다른 내부 레이어를 import할 수 없습니다.',
        }],
      }],
    },
  },
  // constants/ : types/ 만
  {
    files: ['src/constants/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@/lib*', '@/store*', '@/hooks*', '@/components*', '@/workers*'],
          message: 'constants/ 는 types/ 만 import할 수 있습니다.',
        }],
      }],
    },
  },
  // lib/ : types/, constants/ 만
  {
    files: ['src/lib/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@/store*', '@/hooks*', '@/components*', '@/workers*'],
          message: 'lib/ 는 types/, constants/ 만 import할 수 있습니다.',
        }],
      }],
    },
  },
  // workers/ : types/, constants/, lib/ 만 (store·hooks 금지)
  {
    files: ['src/workers/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@/store*', '@/hooks*', '@/components*'],
          message: 'workers/ 는 store/, hooks/, components/ 를 import할 수 없습니다.',
        }],
      }],
    },
  },
  // store/ : types/, constants/, lib/ 만
  {
    files: ['src/store/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@/workers*', '@/hooks*', '@/components*'],
          message: 'store/ 는 types/, constants/, lib/ 만 import할 수 있습니다.',
        }],
      }],
    },
  },
  // hooks/ : types/, store/, lib/ 만
  {
    files: ['src/hooks/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': ['error', {
        patterns: [{
          group: ['@/workers*', '@/components*'],
          message: 'hooks/ 는 workers/, components/ 를 import할 수 없습니다.',
        }],
      }],
    },
  },
])
