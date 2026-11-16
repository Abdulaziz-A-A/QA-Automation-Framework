import type { Locator, Page } from '@playwright/test';
import { BasePage, expect, step } from '@core';
import type { Customer } from '../data/customer.factory';

/** The three checkout screens: your information, overview, and confirmation. */
export class CheckoutPage extends BasePage {
  readonly title: Locator;
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly postalCode: Locator;
  readonly continueButton: Locator;
  readonly cancelButton: Locator;
  readonly finishButton: Locator;
  readonly error: Locator;
  readonly confirmationHeader: Locator;

  constructor(page: Page) {
    super(page);
    this.title = page.getByTestId('title');
    this.firstName = page.getByPlaceholder('First Name');
    this.lastName = page.getByPlaceholder('Last Name');
    this.postalCode = page.getByPlaceholder('Zip/Postal Code');
    this.continueButton = page.getByRole('button', { name: 'Continue' });
    this.cancelButton = page.getByRole('button', { name: 'Cancel' });
    this.finishButton = page.getByRole('button', { name: 'Finish' });
    this.error = page.getByTestId('error');
    this.confirmationHeader = page.getByTestId('complete-header');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.title).toHaveText('Checkout: Your Information');
  }

  @step()
  async fillInformation(customer: Partial<Customer>): Promise<void> {
    if (customer.firstName !== undefined) await this.firstName.fill(customer.firstName);
    if (customer.lastName !== undefined) await this.lastName.fill(customer.lastName);
    if (customer.postalCode !== undefined) await this.postalCode.fill(customer.postalCode);
    await this.continueButton.click();
  }

  /** Amounts shown on the overview screen, as numbers. */
  async totals(): Promise<{ itemTotal: number; tax: number; total: number; itemPrices: number[] }> {
    await expect(this.title).toHaveText('Checkout: Overview');
    const amount = async (testId: string): Promise<number> => {
      const text = await this.page.getByTestId(testId).innerText();
      return Number(text.replace(/[^0-9.]/g, ''));
    };
    const priceTexts = await this.page.getByTestId('inventory-item-price').allTextContents();
    return {
      itemTotal: await amount('subtotal-label'),
      tax: await amount('tax-label'),
      total: await amount('total-label'),
      itemPrices: priceTexts.map((text) => Number(text.replace('$', ''))),
    };
  }

  @step()
  async finish(): Promise<void> {
    await this.finishButton.click();
  }
}
