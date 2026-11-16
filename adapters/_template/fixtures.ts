import { test as base } from '@core';
import { HomePage } from './pages/home.page';

interface TemplateFixtures {
  homePage: HomePage;
}

/** This adapter's `test`: the core fixtures plus its own page objects. */
export const test = base.extend<TemplateFixtures>({
  homePage: async ({ page }, use) => use(new HomePage(page)),
});

export { expect } from '@core';
