import { expect, signedOut, test } from '../../fixtures';

/**
 * Visual regression: compares the page with an approved baseline image.
 * Baselines are environment-specific (fonts differ per OS), so they are created
 * where the comparison will run:  npm run test:visual:update
 */
test.describe('Visual', { tag: ['@visual'] }, () => {
  test.describe('signed out', () => {
    test.use(signedOut);

    test('login page matches the approved baseline', async ({ loginPage, page }) => {
      await loginPage.goto();
      await expect(page).toHaveScreenshot('login.png', { fullPage: true });
    });
  });

  test('catalogue matches the approved baseline', async ({ inventoryPage, page }) => {
    await inventoryPage.goto();
    await expect(page).toHaveScreenshot('catalogue.png', { fullPage: true });
  });
});
