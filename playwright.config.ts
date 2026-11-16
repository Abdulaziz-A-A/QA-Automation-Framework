import { defineConfig } from '@playwright/test';
import { adapters } from './adapters';
import { isCI } from './core/config/env';
import { toProjects } from './core/config/adapter';

/**
 * One config for every application. Nothing here names a specific app:
 * projects are generated from the adapters registered in `adapters/index.ts`.
 */
export default defineConfig({
  projects: [
    // Tests of the framework itself; they need no external site.
    { name: 'core-selftest', testDir: './core/tests' },
    ...toProjects(adapters),
  ],

  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 4 : undefined,
  timeout: 30_000,
  expect: {
    timeout: 7_000,
    toHaveScreenshot: { animations: 'disabled', caret: 'hide', maxDiffPixelRatio: 0.01 },
  },

  outputDir: 'test-results',
  // Visual baselines live next to the tests, one set per app + browser + operating system
  // (fonts render differently per OS, so a Linux baseline cannot judge a Windows screenshot).
  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}-{platform}/{testFilePath}/{arg}{ext}',

  // Locally: a readable HTML report. In CI: a "blob" per job, merged into one report at the end.
  reporter: isCI
    ? [['list'], ['github'], ['blob', { outputDir: 'reports/blob' }], ['junit', { outputFile: 'reports/junit/results.xml' }], ['json', { outputFile: 'reports/json/results.json' }]]
    : [['list'], ['html', { outputFolder: 'reports/html', open: 'never' }], ['junit', { outputFile: 'reports/junit/results.xml' }], ['json', { outputFile: 'reports/json/results.json' }]],

  use: {
    // Evidence is collected only when something goes wrong, to keep runs fast.
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    locale: 'en-US',
    timezoneId: 'Asia/Riyadh',
  },
});
