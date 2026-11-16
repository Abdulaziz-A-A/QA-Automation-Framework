/**
 * Public surface of the framework core. Adapters import from here only:
 *
 *   import { test, expect, BasePage, defineFactory } from '@core';
 */
export { test, type CoreFixtures } from './fixtures/base.fixture';
export { expect } from './helpers/matchers';
export { BasePage, BaseComponent } from './pages/base-page';
export { ApiClient, ApiResponse, type RequestOptions } from './api/api-client';
export { defineFactory, faker, uniqueSuffix, dataSeed, type Factory } from './data/factory';
export { defineEnv, coreEnv, isCI } from './config/env';
export { defineAdapter, toProjects, authFile, adapterDir, type AdapterDefinition } from './config/adapter';
export { step } from './helpers/step';
export { checkA11y, type A11yOptions, type Impact } from './helpers/a11y';
export { createLogger, safeJson, type Logger } from './helpers/logger';
