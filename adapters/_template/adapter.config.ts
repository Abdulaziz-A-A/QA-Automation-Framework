import { defineAdapter } from '@core/config/adapter';
import { env } from './env';

export default defineAdapter({
  name: 'template',
  kind: 'ui',
  baseURL: env.TEMPLATE_BASE_URL,
  // Set `auth: true` and add an `auth.setup.ts` (copy one from saucedemo or odoo)
  // when the application needs a signed-in session.
  auth: false,
});
