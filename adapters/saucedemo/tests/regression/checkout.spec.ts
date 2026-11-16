import { products, TAX_RATE, toCents } from '../../data/catalogue';
import { customerFactory, type Customer } from '../../data/customer.factory';
import { expect, test } from '../../fixtures';

test.describe('Checkout', { tag: ['@regression'] }, () => {
  test.beforeEach(async ({ inventoryPage, header, cartPage, checkoutPage }) => {
    await inventoryPage.goto();
    await inventoryPage.addToCart(products.fleeceJacket.name);
    await inventoryPage.addToCart(products.redTShirt.name);
    await inventoryPage.addToCart(products.onesie.name);
    await header.openCart();
    await cartPage.checkout();
    await checkoutPage.expectLoaded();
  });

  const missingFieldCases: Array<{ field: keyof Customer; error: string }> = [
    { field: 'firstName', error: 'Error: First Name is required' },
    { field: 'lastName', error: 'Error: Last Name is required' },
    { field: 'postalCode', error: 'Error: Postal Code is required' },
  ];

  for (const { field, error } of missingFieldCases) {
    test(`cannot continue without ${field}`, async ({ checkoutPage, page }) => {
      const customer: Partial<Customer> = customerFactory.build();
      delete customer[field];

      await checkoutPage.fillInformation(customer);

      await expect(checkoutPage.error).toHaveText(error);
      await expect(page).toHaveURL(/checkout-step-one\.html$/);
    });
  }

  test('the overview adds up: item total, tax and grand total', async ({ checkoutPage }) => {
    await checkoutPage.fillInformation(customerFactory.build());
    const totals = await checkoutPage.totals();

    const sumOfItems = toCents(totals.itemPrices.reduce((sum, price) => sum + price, 0));
    expect(totals.itemPrices).toHaveLength(3);
    expect(totals.itemTotal, 'item total equals the sum of the listed prices').toBe(sumOfItems);
    expect(totals.tax, `tax is ${TAX_RATE * 100}% of the item total`).toBe(toCents(sumOfItems * TAX_RATE));
    expect(totals.total, 'grand total equals item total plus tax').toBe(toCents(totals.itemTotal + totals.tax));
  });

  test('cancelling on the overview returns to the catalogue and keeps the cart', async ({ checkoutPage, inventoryPage, header }) => {
    await checkoutPage.fillInformation(customerFactory.build());
    await checkoutPage.cancelButton.click();

    await inventoryPage.expectLoaded();
    await expect(header.cartBadge).toHaveText('3');
  });
});
