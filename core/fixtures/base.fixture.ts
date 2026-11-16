import { test as base } from '@playwright/test';
import { ApiClient } from '../api/api-client';
import { dataSeed } from '../data/factory';
import { checkA11y, type A11yOptions } from '../helpers/a11y';
import { createLogger, type Logger } from '../helpers/logger';

export interface CoreFixtures {
  /** Per-test logger; its lines are attached to the report. */
  log: Logger;
  /** HTTP client bound to the adapter's baseURL, with logging and schema checks. */
  api: ApiClient;
  /** Accessibility scan of the current page. */
  a11y: { check(options?: A11yOptions): Promise<void> };
}

/**
 * The framework's `test`. Every adapter extends this one, so every test in every
 * project gets the same logging, API client, accessibility scan and failure
 * diagnostics without writing any setup code.
 */
export const test = base.extend<CoreFixtures>({
  log: async ({}, use, testInfo) => {
    const log = createLogger(testInfo);
    await use(log);

    const lines = log.dump();
    if (lines) await testInfo.attach('test-log.txt', { body: lines, contentType: 'text/plain' });
    if (testInfo.status !== testInfo.expectedStatus) {
      testInfo.annotations.push({ type: 'data seed', description: `FAKER_SEED=${dataSeed} replays this run's generated data` });
    }
  },

  api: async ({ request, log }, use) => {
    await use(new ApiClient(request, log));
  },

  a11y: async ({ page }, use, testInfo) => {
    await use({ check: (options) => checkA11y(page, testInfo, options) });
  },

  // Extends the built-in page: records browser-side problems while the test runs
  // and attaches them when it fails, which is usually the fastest route to the root cause.
  page: async ({ page }, use, testInfo) => {
    const problems: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') problems.push(`console.error: ${message.text()}`);
    });
    page.on('pageerror', (error) => problems.push(`uncaught exception: ${error.message}`));
    page.on('requestfailed', (request) => {
      problems.push(`request failed: ${request.method()} ${request.url()} (${request.failure()?.errorText ?? 'unknown'})`);
    });
    page.on('response', (response) => {
      if (response.status() >= 500) problems.push(`server error: ${response.status()} ${response.request().method()} ${response.url()}`);
    });

    await use(page);

    if (problems.length > 0 && testInfo.status !== testInfo.expectedStatus) {
      await testInfo.attach('browser-problems.txt', { body: problems.join('\n'), contentType: 'text/plain' });
    }
  },
});
