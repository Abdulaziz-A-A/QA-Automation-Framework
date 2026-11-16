import type { Locator, Page } from '@playwright/test';
import { BasePage, expect, step } from '@core';
import type { Contact } from '../data/contact.factory';

/** The form used to create or edit one contact. */
export class ContactFormPage extends BasePage {
  readonly name: Locator;
  readonly email: Locator;
  readonly phone: Locator;
  readonly saveButton: Locator;
  readonly discardButton: Locator;
  readonly notification: Locator;
  readonly breadcrumb: Locator;

  constructor(page: Page) {
    super(page);
    const form = page.locator('.o_form_view');
    this.name = form.getByPlaceholder('Name (company or person)');
    this.email = form.getByPlaceholder('Email', { exact: true });
    this.phone = form.getByPlaceholder('Phone', { exact: true });
    this.saveButton = page.getByRole('button', { name: 'Save manually' });
    this.discardButton = page.getByRole('button', { name: 'Discard all changes' });
    this.notification = page.locator('.o_notification');
    this.breadcrumb = page.locator('.o_breadcrumb');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.name).toBeVisible({ timeout: 60_000 });
  }

  /** Open an existing contact directly by its database id. */
  @step()
  async open(id: number): Promise<void> {
    await this.page.goto(`/odoo/contacts/${id}`);
    await this.expectLoaded();
  }

  @step()
  async fill(contact: Partial<Contact>): Promise<void> {
    if (contact.name !== undefined) await this.name.fill(contact.name);
    if (contact.email !== undefined) await this.email.fill(contact.email);
    if (contact.phone !== undefined) await this.phone.fill(contact.phone);
  }

  /** Save and wait until Odoo confirms there is nothing left unsaved. Returns the record id. */
  @step()
  async save(): Promise<number> {
    await this.saveButton.click();
    await expect(this.saveButton).toBeHidden();
    await expect(this.page).toHaveURL(/\/contacts\/\d+$/);
    return Number(this.page.url().split('/').pop());
  }

  @step()
  async discard(): Promise<void> {
    await this.discardButton.click();
  }
}
