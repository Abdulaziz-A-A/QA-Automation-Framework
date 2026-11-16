import { test as base } from '@core';
import { OdooRpc } from './api/odoo-rpc';
import { contactFactory, type Contact } from './data/contact.factory';
import { ContactFormPage } from './pages/contact-form.page';
import { ContactsPage } from './pages/contacts.page';
import { HomeMenuPage } from './pages/home-menu.page';
import { readInstanceOrigin } from './session';

interface OdooFixtures {
  homeMenu: HomeMenuPage;
  contactsPage: ContactsPage;
  contactForm: ContactFormPage;
  rpc: OdooRpc;
  /** Removes every contact whose name a test registers, after the test ends. */
  contactCleanup: { track(name: string): void };
  /** A contact created through the API before the test and deleted after it. */
  seededContact: Contact & { id: number };
}

export const test = base.extend<OdooFixtures>({
  // Point every test at the server the setup step signed in to.
  baseURL: async ({}, use) => use(readInstanceOrigin()),

  homeMenu: async ({ page }, use) => use(new HomeMenuPage(page)),
  contactsPage: async ({ page }, use) => use(new ContactsPage(page)),
  contactForm: async ({ page }, use) => use(new ContactFormPage(page)),

  rpc: async ({ page, baseURL }, use) => use(new OdooRpc(page.request, baseURL!)),

  contactCleanup: async ({ rpc }, use) => {
    const names: string[] = [];
    await use({ track: (name) => names.push(name) });

    for (const name of names) {
      const found = await rpc.searchRead<{ id: number }>('res.partner', [['name', '=', name]], ['id']);
      if (found.length > 0) await rpc.unlink('res.partner', found.map((row) => row.id));
    }
  },

  seededContact: async ({ rpc, contactCleanup }, use) => {
    const contact = contactFactory.build();
    contactCleanup.track(contact.name);
    const id = await rpc.create('res.partner', { ...contact });
    await use({ ...contact, id });
  },
});

export { expect } from '@core';
