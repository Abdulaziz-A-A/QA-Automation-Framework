import { products } from '../../data/catalogue';
import { expect, test } from '../../fixtures';

test.describe('Shopping cart', { tag: ['@regression'] }, () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('the badge counts products as they are added and removed', async ({ inventoryPage, header }) => {
    await expect(header.cartBadge).toBeHidden();

    await inventoryPage.addToCart(products.backpack.name);
    await expect(header.cartBadge).toHaveText('1');

    await inventoryPage.addToCart(products.fleeceJacket.name);
    await expect(header.cartBadge).toHaveText('2');

    await inventoryPage.removeFromCart(products.backpack.name);
    await expect(header.cartBadge).toHaveText('1');
  });

  test('keeps its contents after a page reload', async ({ inventoryPage, header, cartPage, page }) => {
    await inventoryPage.addToCart(products.boltTShirt.name);
    await page.reload();

    await expect(header.cartBadge).toHaveText('1');
    await header.openCart();
    expect(await cartPage.productNames()).toEqual([products.boltTShirt.name]);
  });

  test('a product can be removed from inside the cart', async ({ inventoryPage, header, cartPage }) => {
    await inventoryPage.addToCart(products.backpack.name);
    await inventoryPage.addToCart(products.onesie.name);
    await header.openCart();

    await cartPage.remove(products.backpack.name);

    expect(await cartPage.productNames()).toEqual([products.onesie.name]);
    await expect(header.cartBadge).toHaveText('1');
  });

  test('"Continue Shopping" returns to the catalogue with the cart intact', async ({ inventoryPage, header, cartPage }) => {
    await inventoryPage.addToCart(products.bikeLight.name);
    await header.openCart();
    await cartPage.continueShoppingButton.click();

    await inventoryPage.expectLoaded();
    await expect(header.cartBadge).toHaveText('1');
  });

  test('"Reset App State" empties the cart', async ({ inventoryPage, header }) => {
    await inventoryPage.addToCart(products.backpack.name);
    await expect(header.cartBadge).toHaveText('1');

    await header.resetAppState();
    await expect(header.cartBadge).toBeHidden();
  });
});
