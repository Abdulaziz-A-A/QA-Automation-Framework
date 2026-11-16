import { env } from '../../env';
import { expect, signedOut, test } from '../../fixtures';

test.describe('Login', { tag: ['@smoke'] }, () => {
  test.use(signedOut);

  test('a standard user can sign in and reach the product catalogue', async ({ loginPage, inventoryPage, page }) => {
    await loginPage.goto();
    await loginPage.login(env.SAUCEDEMO_USERNAME, env.SAUCEDEMO_PASSWORD);

    await inventoryPage.expectLoaded();
    await expect(page).toHaveURL(/\/inventory\.html$/);
  });

  test('a locked-out user is refused with a clear message', async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login('locked_out_user', env.SAUCEDEMO_PASSWORD);

    await expect(loginPage.error).toHaveText('Epic sadface: Sorry, this user has been locked out.');
    await expect(page).not.toHaveURL(/inventory/);
  });
});
