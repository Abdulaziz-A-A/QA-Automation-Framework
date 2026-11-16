import type { Locator, Page } from '@playwright/test';
import { BasePage, expect } from '@core';

/** Example page object. Rename it and describe a real screen of your application. */
export class HomePage extends BasePage {
  protected override readonly path = '/';

  readonly content: Locator;

  constructor(page: Page) {
    super(page);
    // Replace with a real landmark of your page. Prefer what the user sees:
    // page.getByRole('heading', { name: 'Dashboard' }), getByLabel(...), getByText(...),
    // and fall back to getByTestId(...) only when none of those exist.
    this.content = page.locator('body');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.content).toBeVisible();
  }
}
