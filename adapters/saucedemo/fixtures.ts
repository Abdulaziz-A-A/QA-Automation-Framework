import { test as base } from '@core';
import { CartPage } from './pages/cart.page';
import { CheckoutPage } from './pages/checkout.page';
import { Header } from './pages/header.component';
import { InventoryPage } from './pages/inventory.page';
import { LoginPage } from './pages/login.page';

interface SauceDemoFixtures {
  loginPage: LoginPage;
  inventoryPage: InventoryPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  header: Header;
}

/**
 * The saucedemo `test`: the core fixtures plus this app's page objects.
 * A test simply names what it needs: `test('...', async ({ inventoryPage, header }) => ...)`.
 */
export const test = base.extend<SauceDemoFixtures>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  inventoryPage: async ({ page }, use) => use(new InventoryPage(page)),
  cartPage: async ({ page }, use) => use(new CartPage(page)),
  checkoutPage: async ({ page }, use) => use(new CheckoutPage(page)),
  header: async ({ page }, use) => use(new Header(page)),
});

export { expect } from '@core';

/** Use in a describe block to start signed out: `test.use(signedOut)`. */
export const signedOut = { storageState: { cookies: [], origins: [] } };
