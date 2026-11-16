import { expect, signedOut, test } from '../../fixtures';

/**
 * Data-driven test: one row per case. Adding a case is adding a row, not a test.
 */
const invalidLogins = [
  { name: 'empty form', username: '', password: '', error: 'Epic sadface: Username is required' },
  { name: 'missing password', username: 'standard_user', password: '', error: 'Epic sadface: Password is required' },
  { name: 'missing username', username: '', password: 'secret_sauce', error: 'Epic sadface: Username is required' },
  {
    name: 'wrong password',
    username: 'standard_user',
    password: 'not-the-password',
    error: 'Epic sadface: Username and password do not match any user in this service',
  },
  {
    name: 'unknown user',
    username: 'nobody_here',
    password: 'secret_sauce',
    error: 'Epic sadface: Username and password do not match any user in this service',
  },
  {
    name: 'password is case-sensitive',
    username: 'standard_user',
    password: 'SECRET_SAUCE',
    error: 'Epic sadface: Username and password do not match any user in this service',
  },
];

test.describe('Login validation', { tag: ['@regression'] }, () => {
  test.use(signedOut);

  for (const attempt of invalidLogins) {
    test(`login is rejected: ${attempt.name}`, async ({ loginPage, page }) => {
      await loginPage.goto();
      await loginPage.login(attempt.username, attempt.password);

      await expect(loginPage.error).toHaveText(attempt.error);
      await expect(page).toHaveURL(/\/$/);
    });
  }

  test('the error message can be dismissed', async ({ loginPage, page }) => {
    await loginPage.goto();
    await loginPage.login('', '');
    await expect(loginPage.error).toBeVisible();

    await page.getByTestId('error-button').click();
    await expect(loginPage.error).toBeHidden();
  });
});
