import { products } from '../../data/catalogue';
import { signedOut, test } from '../../fixtures';

/**
 * Accessibility scans with axe-core against WCAG 2.1 A/AA.
 * A scan fails on any violation of "serious" impact or above. Violations that are
 * already known and accepted can be listed with `a11y.check({ knownIssues: { ruleId: 'ticket' } })`,
 * which keeps them visible in the report without failing the build.
 */
test.describe('Accessibility', { tag: ['@a11y'] }, () => {
  test.describe('signed out', () => {
    test.use(signedOut);

    test('login page has no serious WCAG A/AA violations', async ({ loginPage, a11y }) => {
      await loginPage.goto();
      await a11y.check();
    });
  });

  test('catalogue has no serious WCAG A/AA violations', async ({ inventoryPage, a11y }) => {
    await inventoryPage.goto();
    await a11y.check();
  });

  test('cart has no serious WCAG A/AA violations', async ({ inventoryPage, header, cartPage, a11y }) => {
    await inventoryPage.goto();
    await inventoryPage.addToCart(products.backpack.name);
    await header.openCart();
    await cartPage.expectLoaded();
    await a11y.check();
  });
});
