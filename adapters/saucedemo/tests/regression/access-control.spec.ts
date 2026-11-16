import { expect, signedOut, test } from '../../fixtures';

test.describe('Access control', { tag: ['@regression'] }, () => {
  test.describe('signed out', () => {
    test.use(signedOut);

    for (const path of ['/inventory.html', '/cart.html', '/checkout-step-one.html', '/checkout-step-two.html']) {
      test(`${path} is not reachable without signing in`, async ({ page, loginPage }) => {
        await page.goto(path);

        await loginPage.expectLoaded();
        await expect(loginPage.error).toHaveText(`Epic sadface: You can only access '${path}' when you are logged in.`);
      });
    }
  });

  test('logging out ends the session', async ({ inventoryPage, header, loginPage, page }) => {
    await inventoryPage.goto();
    await header.logout();
    await loginPage.expectLoaded();

    await page.goto('/inventory.html');
    await loginPage.expectLoaded();
    await expect(loginPage.error).toContainText('when you are logged in');
  });
});
