import { defineAdapter } from '@core/config/adapter';
import { env } from './env';

export default defineAdapter({
  name: 'restful-booker',
  kind: 'api',
  baseURL: env.RESTFUL_BOOKER_BASE_URL,
  use: { extraHTTPHeaders: { 'Content-Type': 'application/json' } },
});
