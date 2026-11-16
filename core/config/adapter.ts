import path from 'node:path';
import { devices, type PlaywrightTestConfig } from '@playwright/test';
import { coreEnv, type BrowserName } from './env';

/** A Playwright project carrying the full set of browser and test options. */
export type Project = NonNullable<PlaywrightTestConfig['projects']>[number];

/**
 * An adapter is everything the framework needs to know about ONE application
 * under test. The core never changes between applications; adapters do.
 */
export interface AdapterDefinition {
  /** Unique short name. Becomes the Playwright project name and the folder name. */
  name: string;
  /** `ui` adapters run in real browsers; `api` adapters need no browser at all. */
  kind: 'ui' | 'api';
  /** Root URL of the application under test. Tests use relative paths only. */
  baseURL: string;
  /**
   * Optional login-once step. When true, `auth.setup.ts` in the adapter folder
   * runs first and saves the signed-in browser state, which every test then reuses.
   */
  auth?: boolean;
  /** Per-test timeout override (ms) for slow applications. */
  timeout?: number;
  /** Extra Playwright options for this application only (test id attribute, locale...). */
  use?: Project['use'];
}

export function defineAdapter(definition: AdapterDefinition): AdapterDefinition {
  if (!/^[a-z0-9-]+$/.test(definition.name)) {
    throw new Error(`Adapter name "${definition.name}" must be lower-case letters, digits and dashes.`);
  }
  return definition;
}

export const adapterDir = (name: string): string => path.join(coreEnv.ROOT_DIR, 'adapters', name);

/** Where an adapter's signed-in browser state is stored between the setup step and the tests. */
export const authFile = (name: string): string => path.join(coreEnv.ROOT_DIR, '.auth', `${name}.json`);

const deviceFor: Record<BrowserName, (typeof devices)[string]> = {
  chromium: devices['Desktop Chrome']!,
  firefox: devices['Desktop Firefox']!,
  webkit: devices['Desktop Safari']!,
};

/**
 * Turn adapter definitions into Playwright projects:
 *   - api adapter   ->  `<name>`
 *   - ui adapter    ->  `<name>-<browser>` for every browser in BROWSERS
 *   - auth: true    ->  an extra `<name>-setup` project the others depend on
 */
export function toProjects(adapters: AdapterDefinition[]): Project[] {
  const projects: Project[] = [];

  for (const adapter of adapters) {
    const testDir = adapterDir(adapter.name);
    const shared = { baseURL: adapter.baseURL, ...adapter.use };
    const setupName = `${adapter.name}-setup`;

    if (adapter.auth) {
      projects.push({
        name: setupName,
        testDir,
        testMatch: /auth\.setup\.ts$/,
        timeout: adapter.timeout,
        use: { ...deviceFor.chromium, ...shared },
      });
    }

    const base: Project = {
      testDir: path.join(testDir, 'tests'),
      timeout: adapter.timeout,
      dependencies: adapter.auth ? [setupName] : [],
    };
    const storageState = adapter.auth ? { storageState: authFile(adapter.name) } : {};

    if (adapter.kind === 'api') {
      projects.push({ ...base, name: adapter.name, use: { ...shared } });
      continue;
    }

    for (const browser of coreEnv.BROWSERS) {
      projects.push({
        ...base,
        name: `${adapter.name}-${browser}`,
        use: { ...deviceFor[browser], ...shared, ...storageState },
      });
    }
  }

  return projects;
}
