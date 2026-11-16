import { z } from 'zod';
import { defineEnv } from '@core';

/** Defaults are the public practice-API values from the restful-booker documentation. */
export const env = defineEnv({
  RESTFUL_BOOKER_BASE_URL: z.string().url().default('https://restful-booker.herokuapp.com'),
  RESTFUL_BOOKER_USERNAME: z.string().default('admin'),
  RESTFUL_BOOKER_PASSWORD: z.string().default('password123'),
});
