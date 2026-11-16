import type { Locator, Page } from '@playwright/test';
import { BaseComponent, step } from '@core';

/**
 * Odoo's search bar. It is the same widget in every Odoo app (Contacts, Sales,
 * Inventory...), so it is written once as a component and reused by any page.
 */
export class SearchView extends BaseComponent {
  readonly input: Locator;
  readonly facets: Locator;

  constructor(page: Page) {
    super(page, page.locator('.o_searchview'));
    this.input = this.root.getByRole('searchbox');
    this.facets = this.root.locator('.o_searchview_facet');
  }

  /** Type a term and apply it as a filter on the default field. */
  @step()
  async search(term: string): Promise<void> {
    await this.input.fill(term);
    await this.input.press('Enter');
    await this.facets.filter({ hasText: term }).waitFor();
  }
}
