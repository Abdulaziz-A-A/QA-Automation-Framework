import playwright from 'eslint-plugin-playwright';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['node_modules', 'reports', 'test-results', '.auth'] },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      // Playwright fixtures that need nothing use an empty destructuring pattern: `async ({}, use) => ...`
      'no-empty-pattern': 'off',
    },
  },
  {
    // Rules that keep tests reliable: no fixed sleeps, no forgotten awaits, no focused or skipped tests.
    ...playwright.configs['flat/recommended'],
    files: ['adapters/**/*.ts', 'core/**/*.ts'],
    rules: {
      ...playwright.configs['flat/recommended'].rules,
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-focused-test': 'error',
      'playwright/no-skipped-test': 'error',
      'playwright/missing-playwright-await': 'error',
      // Assertions often live in page objects (`expectLoaded`) and response helpers (`expectStatus`).
      'playwright/expect-expect': ['error', { assertFunctionNames: ['expectLoaded', 'expectStatus', 'check', 'checkA11y'] }],
    },
  },
  {
    // Helpers and setup steps are not test bodies: branching there is fine.
    files: ['**/api/**/*.ts', '**/*.setup.ts', 'core/helpers/**/*.ts'],
    rules: { 'playwright/no-conditional-in-test': 'off' },
  },
);
