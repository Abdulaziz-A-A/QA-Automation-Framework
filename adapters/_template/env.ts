import { z } from 'zod';
import { defineEnv } from '@core';

/**
 * Environment variables owned by this adapter.
 * Credentials have NO default on purpose: they must come from `.env` locally
 * and from CI secrets in the pipeline, never from the repository.
 */
export const env = defineEnv({
  TEMPLATE_BASE_URL: z.string().url().default('https://example.com'),
  TEMPLATE_USERNAME: z.string().optional(),
  TEMPLATE_PASSWORD: z.string().optional(),
});
