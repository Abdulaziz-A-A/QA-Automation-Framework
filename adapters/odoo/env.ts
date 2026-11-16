import { z } from 'zod';
import { defineEnv } from '@core';

/**
 * By default this adapter opens Odoo's public demo, which signs every visitor in
 * automatically. To test your own Odoo, set ODOO_BASE_URL, ODOO_USERNAME and ODOO_PASSWORD.
 */
export const env = defineEnv({
  ODOO_BASE_URL: z.string().url().default('https://demo.odoo.com'),
  ODOO_USERNAME: z.string().optional(),
  ODOO_PASSWORD: z.string().optional(),
});
