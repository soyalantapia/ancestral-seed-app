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
      globals: globals.browser,
    },
    rules: {
      // Prefijo `_` = "intencionalmente sin usar" (params placeholder de
      // integraciones futuras: PostHog/Sentry). Convención estándar.
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // Reglas de React-Compiler-readiness de react-hooks v7. El proyecto es
      // CSR (Vite + MSW, sin SSR/hidratación) y todavía no usa el compiler:
      // los patrones que marcan (setState de reset en effect, Date.now de
      // display, ref en render) son benignos acá. Las dejamos como WARN
      // (visibles y trackeadas) en vez de bloquear, y arreglamos a mano los
      // casos que SÍ son bugs reales. `rules-of-hooks` SE MANTIENE como error
      // (es correctitud real: hooks condicionales = crash).
      'react-hooks/set-state-in-effect': 'warn',
      'react-hooks/purity': 'warn',
      'react-hooks/refs': 'warn',
      // Fast Refresh / DX — no afecta runtime (ej. button.tsx exporta
      // buttonVariants, patrón shadcn; routes.tsx/main.tsx son especiales).
      'react-refresh/only-export-components': 'warn',
    },
  },
])
