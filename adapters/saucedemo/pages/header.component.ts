import type { Locator, Page } from '@playwright/test';
import { BaseComponent, step } from '@core';

/** The bar shown on every signed-in page: menu, cart link and cart badge. */
export class Header extends BaseComponent {
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly menuButton: Locator;

  constructor(page: Page) {
    super(page, page.getByTestId('primary-header'));
    this.cartLink = this.root.getByTestId('shopping-cart-link');
    this.cartBadge = this.root.getByTestId('shopping-cart-badge');
    this.menuButton = this.root.getByRole('button', { name: 'Open Menu' });
  }

  @step()
  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  @step()
  async logout(): Promise<void> {
    await this.menuButton.click();
    await this.page.getByRole('button', { name: 'Logout' }).click();
  }

  @step()
  async resetAppState(): Promise<void> {
    await this.menuButton.click();
    await this.page.getByRole('button', { name: 'Reset App State' }).click();
    await this.page.getByRole('button', { name: 'Close Menu' }).click();
  }
}
