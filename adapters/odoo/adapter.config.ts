import { defineAdapter } from '@core/config/adapter';
import { env } from './env';

export default defineAdapter({
  name: 'odoo',
  kind: 'ui',
  baseURL: env.ODOO_BASE_URL,
  auth: true,
  // An ERP is a heavy single-page application and the public demo is a shared server:
  // give it more time than a small shop needs.
  timeout: 120_000,
  use: { navigationTimeout: 90_000, actionTimeout: 20_000, viewport: { width: 1366, height: 800 } },
});
