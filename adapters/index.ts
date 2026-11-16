import type { AdapterDefinition } from '../core/config/adapter';
import odoo from './odoo/adapter.config';
import restfulBooker from './restful-booker/adapter.config';
import saucedemo from './saucedemo/adapter.config';

/**
 * The registry: every application the framework can test.
 * `npm run new:adapter -- <name>` adds a line here for you.
 */
export const adapters: AdapterDefinition[] = [
  saucedemo,
  restfulBooker,
  odoo,
  // new adapters are registered above this line
];
