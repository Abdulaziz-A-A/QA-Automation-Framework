import path from 'node:path';
import dotenv from 'dotenv';
import { z } from 'zod';

/**
 * Environment loading.
 *
 * Files are layered, first match wins for each variable:
 *   real environment variables  >  .env.<TEST_ENV>.local  >  .env.<TEST_ENV>  >  .env
 *
 * That gives one switch (`TEST_ENV=staging npx playwright test`) to move the whole
 * suite between environments without touching a single test.
 */
const root = path.resolve(__dirname, '..', '..');
const testEnv = process.env.TEST_ENV ?? 'demo';

dotenv.config({
  path: [`.env.${testEnv}.local`, `.env.${testEnv}`, '.env'].map((file) => path.join(root, file)),
  quiet: true,
});

/** Treat empty strings ("FOO=") as "not set" so defaults still apply. */
function cleanedEnv(): Record<string, string> {
  const cleaned: Record<string, string> = {};
  for (const [key, value] of Object.entries(process.env)) {
    if (value !== undefined && value.trim() !== '') cleaned[key] = value;
  }
  return cleaned;
}

/**
 * Validate a slice of the environment against a zod schema.
 * Each adapter declares only the variables it owns; a missing or malformed value
 * fails fast with a readable message instead of a confusing mid-test error.
 */
export function defineEnv<Shape extends z.ZodRawShape>(shape: Shape): z.infer<z.ZodObject<Shape>> {
  const result = z.object(shape).safeParse(cleanedEnv());
  if (!result.success) {
    const problems = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment configuration (TEST_ENV=${testEnv}):\n${problems}`);
  }
  return result.data;
}

const browserName = z.enum(['chromium', 'firefox', 'webkit']);
export type BrowserName = z.infer<typeof browserName>;

/** Settings shared by the whole framework. */
export const coreEnv = {
  ...defineEnv({
    CI: z.string().optional(),
    BROWSERS: z
      .string()
      .default('chromium')
      .transform((value) => value.split(',').map((name) => name.trim()))
      .pipe(z.array(browserName).min(1)),
    FAKER_SEED: z.coerce.number().int().optional(),
  }),
  TEST_ENV: testEnv,
  ROOT_DIR: root,
};

export const isCI = Boolean(coreEnv.CI);
