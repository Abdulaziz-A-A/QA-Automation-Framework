import { authFile, test as setup } from '@core';
import { env } from './env';
import { HomeMenuPage } from './pages/home-menu.page';
import { saveInstanceOrigin } from './session';

/**
 * Runs once before the Odoo tests and saves a signed-in session.
 *   - Public demo (default): opening the site creates a signed-in demo session.
 *   - Your own Odoo: signs in through the standard login form with ODOO_USERNAME / ODOO_PASSWORD.
 */
setup('open a signed-in Odoo session', async ({ page }) => {
  setup.setTimeout(180_000);

  if (env.ODOO_USERNAME && env.ODOO_PASSWORD) {
    await page.goto('/web/login');
    await page.getByLabel('Email').fill(env.ODOO_USERNAME);
    await page.getByLabel('Password').fill(env.ODOO_PASSWORD);
    await page.getByRole('button', { name: 'Log in' }).click();
  } else {
    await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 150_000 });
  }

  await new HomeMenuPage(page).expectLoaded(120_000);

  saveInstanceOrigin(new URL(page.url()).origin);
  await page.context().storageState({ path: authFile('odoo') });
});
