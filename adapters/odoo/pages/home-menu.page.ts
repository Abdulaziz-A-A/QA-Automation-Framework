import type { Locator, Page } from '@playwright/test';
import { BasePage, expect, step } from '@core';

/** The app launcher shown after signing in. */
export class HomeMenuPage extends BasePage {
  protected override readonly path = '/odoo';

  readonly apps: Locator;

  constructor(page: Page) {
    super(page);
    this.apps = page.getByRole('option');
  }

  async expectLoaded(timeout = 60_000): Promise<void> {
    await expect(this.apps.first()).toBeVisible({ timeout });
  }

  async appNames(): Promise<string[]> {
    const names = await this.apps.allInnerTexts();
    return names.map((name) => name.trim());
  }

  @step()
  async openApp(name: string): Promise<void> {
    await this.apps.filter({ hasText: new RegExp(`^\\s*${name}\\s*$`) }).click();
  }
}
