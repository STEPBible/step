import js from '@eslint/js';
import globals from 'globals';
import tseslint from 'typescript-eslint';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs,ts,mts,cts}'],
    ignores: ['dist/**', 'node_modules/**'],
    languageOptions: {
      globals: globals.browser,
      ecmaVersion: 'latest',
      sourceType: 'module'
    },
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended // keep if you use TypeScript
    ],
    rules: {
      // ==== Strong correctness / safety ====
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-implicit-coercion': 'error',
      'no-implied-eval': 'error',
      'no-new-func': 'error',
      'no-eval': 'error',
      'no-invalid-this': 'error',
      'no-unused-vars': ['error', { args: 'after-used', ignoreRestSiblings: false }],
      'no-undef': 'error',
      'no-throw-literal': 'error',
      'require-atomic-updates': 'error',
      'no-return-await': 'error',
      'no-promise-executor-return': 'error',
      'no-unsafe-finally': 'error',
      'use-isnan': 'error',
      'valid-typeof': ['error', { requireStringLiterals: true }],

      // ==== Code clarity ====
      'no-shadow': ['error', { builtinGlobals: false, hoist: 'all' }],
      'consistent-return': 'error',
      'no-param-reassign': ['error', { props: true }],
      'no-redeclare': 'error',
      'no-unneeded-ternary': 'error',
      'no-useless-return': 'error',
      'no-useless-catch': 'error',
      'no-empty': ['error', { allowEmptyCatch: false }],

      // ==== Style (strict but readable) ====
      semi: ['error', 'always'],
      quotes: ['error', 'single', { avoidEscape: true }],
      indent: ['error', 2, { SwitchCase: 1 }],
      'brace-style': ['error', '1tbs'],
      'comma-dangle': ['error', 'never'],
      'no-trailing-spaces': 'error',
      'eol-last': ['error', 'always'],

      // ==== Strict mode ====
      strict: ['error', 'global']
    }
  }
]);
