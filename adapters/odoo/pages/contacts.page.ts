import type { Locator, Page } from '@playwright/test';
import { BasePage, expect, step } from '@core';
import { SearchView } from './search-view.component';

/** The Contacts list. */
export class ContactsPage extends BasePage {
  protected override readonly path = '/odoo/contacts';

  readonly search: SearchView;
  readonly newButton: Locator;
  readonly rows: Locator;
  readonly breadcrumb: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    super(page);
    this.search = new SearchView(page);
    this.newButton = page.getByRole('button', { name: 'New', exact: true });
    // `o_data_row` is Odoo's own stable hook for a record row, in every list view.
    this.rows = page.locator('.o_data_row');
    this.breadcrumb = page.locator('.o_breadcrumb');
    this.emptyState = page.locator('.o_view_nocontent');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.breadcrumb).toHaveText('Contacts', { timeout: 60_000 });
    await expect(this.newButton).toBeVisible();
  }

  row(contactName: string): Locator {
    return this.rows.filter({ hasText: contactName });
  }

  @step()
  async startNewContact(): Promise<void> {
    await this.newButton.click();
  }
}
