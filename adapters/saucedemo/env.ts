import { z } from 'zod';
import { defineEnv } from '@core';

/**
 * The defaults are the public practice-site values published on saucedemo.com itself.
 * For a real application, remove the credential defaults so they must come from `.env` or CI secrets.
 */
export const env = defineEnv({
  SAUCEDEMO_BASE_URL: z.string().url().default('https://www.saucedemo.com'),
  SAUCEDEMO_USERNAME: z.string().default('standard_user'),
  SAUCEDEMO_PASSWORD: z.string().default('secret_sauce'),
});
