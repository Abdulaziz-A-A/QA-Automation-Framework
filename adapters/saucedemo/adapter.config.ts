import { defineAdapter } from '@core/config/adapter';
import { env } from './env';

export default defineAdapter({
  name: 'saucedemo',
  kind: 'ui',
  baseURL: env.SAUCEDEMO_BASE_URL,
  auth: true,
  // The site marks its elements with data-test="..."; this makes getByTestId() use it.
  use: { testIdAttribute: 'data-test' },
});
