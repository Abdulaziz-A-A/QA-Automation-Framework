import { expect, test } from '../../fixtures';

test.describe('Odoo is usable', { tag: ['@smoke'] }, () => {
  test('the home menu offers the core business apps', async ({ homeMenu }) => {
    await homeMenu.goto();

    const apps = await homeMenu.appNames();
    for (const app of ['Contacts', 'CRM', 'Sales']) {
      expect(apps, `"${app}" should be on the home menu`).toContain(app);
    }
  });

  test('the Contacts app opens from the home menu and lists records', async ({ homeMenu, contactsPage }) => {
    await homeMenu.goto();
    await homeMenu.openApp('Contacts');

    await contactsPage.expectLoaded();
    await expect(contactsPage.rows.first()).toBeVisible();
  });
});
