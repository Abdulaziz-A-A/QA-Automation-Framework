import { bookingIdsSchema } from '../../api/schemas';
import { expect, test } from '../../fixtures';

test.describe('Booking API is up', { tag: ['@smoke', '@api'] }, () => {
  test('the health check answers', async ({ bookings }) => {
    const response = await bookings.ping();

    // This service documents 201 Created for its health check.
    response.expectStatus(201);
    expect(response.durationMs, 'health check should answer within 5 seconds').toBeLessThan(5000);
  });

  test('the booking list returns well-formed ids', async ({ bookings }) => {
    const ids = (await bookings.list()).expectStatus(200).parse(bookingIdsSchema);

    expect(ids.length).toBeGreaterThan(0);
  });
});
