import { FlatCompat } from '@eslint/eslintrc'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import importPlugin from 'eslint-plugin-import'

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
})

const eslintConfig = [
  {
    ignores: ['.next/**', 'node_modules/**', 'out/**', '.convex/_generated/**']
  },
  ...compat.config({
    extends: ['next/core-web-vitals', 'next/typescript'],
  }),
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'simple-import-sort': simpleImportSort,
      'import': importPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json',
        },
        node: {
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      },
    },
    rules: {
      // Simple import sort rules - disabled to allow flexible import ordering
      'simple-import-sort/imports': 'off',
      'simple-import-sort/exports': 'off',

      // Additional import rules - disabled to allow flexible import ordering
      'import/first': 'off',
      'import/newline-after-import': 'off',
      'import/no-duplicates': 'error', // Keep this one as it prevents actual duplicates
    },
  },
]

export default eslintConfig
