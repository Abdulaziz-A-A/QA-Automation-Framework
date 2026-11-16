import { uniqueSuffix } from '@core';
import { contactFactory } from '../../data/contact.factory';
import { expect, test } from '../../fixtures';

interface PartnerRow {
  id: number;
  name: string;
  email: string | false;
  phone: string | false;
}

test.describe('Contacts', { tag: ['@regression'] }, () => {
  test('a new contact is saved with the details entered', async ({ contactsPage, contactForm, rpc, contactCleanup }) => {
    const contact = contactFactory.build();
    contactCleanup.track(contact.name);

    await contactsPage.goto();
    await contactsPage.startNewContact();
    await contactForm.fill(contact);
    const id = await contactForm.save();

    await expect(contactForm.breadcrumb).toContainText(contact.name);
    // Check the stored record, not only what the screen shows.
    const [stored] = await rpc.searchRead<PartnerRow>('res.partner', [['id', '=', id]], ['name', 'email', 'phone']);
    expect(stored).toMatchObject({ name: contact.name, email: contact.email });
    expect(String(stored?.phone).replace(/\D/g, '')).toContain(contact.phone);
  });

  test('a contact cannot be saved without a name', async ({ contactsPage, contactForm, page }) => {
    await contactsPage.goto();
    await contactsPage.startNewContact();
    await contactForm.expectLoaded();
    await contactForm.saveButton.click();

    await expect(contactForm.notification).toContainText('Missing required fields');
    await expect(page.locator('.o_field_invalid[name="name"]')).toBeVisible();
    await expect(page).toHaveURL(/\/contacts\/new$/);
  });

  test('discarding a new contact creates nothing', async ({ contactsPage, contactForm, rpc }) => {
    const contact = contactFactory.build();

    await contactsPage.goto();
    await contactsPage.startNewContact();
    await contactForm.fill({ name: contact.name });
    await contactForm.discard();

    await contactsPage.expectLoaded();
    expect(await rpc.searchCount('res.partner', [['name', '=', contact.name]])).toBe(0);
  });

  test('searching by name finds exactly the matching contact', async ({ contactsPage, seededContact }) => {
    await contactsPage.goto();
    await contactsPage.search.search(seededContact.name);

    await expect(contactsPage.rows).toHaveCount(1);
    await expect(contactsPage.row(seededContact.name)).toContainText(seededContact.email);
  });

  test('searching for a name nobody has shows no records', async ({ contactsPage }) => {
    await contactsPage.goto();
    await contactsPage.search.search(`no-such-contact-${uniqueSuffix()}`);

    await expect(contactsPage.rows).toHaveCount(0);
  });

  test('an edited contact keeps its changes', async ({ contactForm, seededContact, rpc }) => {
    const newEmail = `edited.${uniqueSuffix()}@example.com`;

    await contactForm.open(seededContact.id);
    await contactForm.fill({ email: newEmail });
    await contactForm.save();

    const [stored] = await rpc.searchRead<PartnerRow>('res.partner', [['id', '=', seededContact.id]], ['name', 'email']);
    expect(stored).toMatchObject({ name: seededContact.name, email: newEmail });
  });
});
