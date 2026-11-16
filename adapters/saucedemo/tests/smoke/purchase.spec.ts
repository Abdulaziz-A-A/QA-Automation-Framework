import { products, TAX_RATE, toCents } from '../../data/catalogue';
import { customerFactory } from '../../data/customer.factory';
import { expect, test } from '../../fixtures';

test('a customer can buy two products from catalogue to confirmation', { tag: ['@smoke'] }, async ({
  inventoryPage,
  header,
  cartPage,
  checkoutPage,
  log,
}) => {
  const basket = [products.backpack, products.bikeLight];
  const customer = customerFactory.build();
  log.info('Buying', { basket: basket.map((product) => product.name), customer });

  await inventoryPage.goto();
  for (const product of basket) await inventoryPage.addToCart(product.name);
  await expect(header.cartBadge).toHaveText(String(basket.length));

  await header.openCart();
  await cartPage.expectLoaded();
  expect(await cartPage.productNames()).toEqual(basket.map((product) => product.name));

  await cartPage.checkout();
  await checkoutPage.fillInformation(customer);

  const expectedItemTotal = toCents(basket.reduce((sum, product) => sum + product.price, 0));
  const totals = await checkoutPage.totals();
  expect(totals.itemTotal).toBe(expectedItemTotal);
  expect(totals.tax).toBe(toCents(expectedItemTotal * TAX_RATE));
  expect(totals.total).toBe(toCents(totals.itemTotal + totals.tax));

  await checkoutPage.finish();
  await expect(checkoutPage.confirmationHeader).toHaveText('Thank you for your order!');
  await expect(header.cartBadge).toBeHidden();
});
