import { products } from '../../data/catalogue';
import { expect, test } from '../../fixtures';

test.describe('Product catalogue', { tag: ['@regression'] }, () => {
  test.beforeEach(async ({ inventoryPage }) => {
    await inventoryPage.goto();
  });

  test('shows every product with its catalogue price', async ({ inventoryPage }) => {
    const expected = Object.values(products);
    await expect(inventoryPage.items).toHaveCount(expected.length);

    for (const product of expected) {
      await expect(inventoryPage.item(product.name).getByTestId('inventory-item-price')).toHaveText(`$${product.price}`);
    }
  });

  test('is sorted by name A to Z by default', async ({ inventoryPage }) => {
    expect(await inventoryPage.productNames()).toBeSorted();
  });

  test('sorts by name Z to A', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('Name (Z to A)');
    expect(await inventoryPage.productNames()).toBeSorted({ descending: true });
  });

  test('sorts by price low to high', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('Price (low to high)');
    expect(await inventoryPage.productPrices()).toBeSorted();
  });

  test('sorts by price high to low', async ({ inventoryPage }) => {
    await inventoryPage.sortBy('Price (high to low)');
    expect(await inventoryPage.productPrices()).toBeSorted({ descending: true });
  });

  test('opens the product details from the product name', async ({ inventoryPage, page }) => {
    await inventoryPage.item(products.onesie.name).getByTestId('inventory-item-name').click();

    await expect(page).toHaveURL(/inventory-item\.html\?id=\d+/);
    await expect(page.getByTestId('inventory-item-name')).toHaveText(products.onesie.name);
    await expect(page.getByTestId('inventory-item-price')).toHaveText(`$${products.onesie.price}`);
  });
});
