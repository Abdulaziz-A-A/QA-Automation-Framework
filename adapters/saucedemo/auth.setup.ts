import { authFile, test as setup } from '@core';
import { env } from './env';
import { LoginPage } from './pages/login.page';
import { InventoryPage } from './pages/inventory.page';

/**
 * Runs once before the saucedemo tests: signs in through the real UI and saves the
 * browser state. Every test then starts already signed in, so login is exercised
 * once here (and in its own dedicated tests) instead of being repeated everywhere.
 */
setup('sign in and save the session', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(env.SAUCEDEMO_USERNAME, env.SAUCEDEMO_PASSWORD);
  await new InventoryPage(page).expectLoaded();
  await page.context().storageState({ path: authFile('saucedemo') });
});
