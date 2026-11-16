import { expect, test } from '../../fixtures';

test('the home page loads', { tag: ['@smoke'] }, async ({ homePage, page }) => {
  await homePage.goto();

  await expect(page).toHaveTitle(/.+/);
});
