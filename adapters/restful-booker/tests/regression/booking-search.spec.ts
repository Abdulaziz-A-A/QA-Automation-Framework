import { uniqueSuffix } from '@core';
import { bookingIdsSchema, createdBookingSchema } from '../../api/schemas';
import { bookingFactory } from '../../data/booking.factory';
import { expect, test } from '../../fixtures';

test.describe('Booking search', { tag: ['@regression', '@api'] }, () => {
  test('filtering by guest name finds exactly the matching booking', async ({ bookings, adminBookings }) => {
    // A unique surname makes the test independent of whatever else is in the shared database.
    const booking = bookingFactory.build({ firstname: 'Searchable', lastname: `Guest${uniqueSuffix()}` });
    const created = (await bookings.create(booking)).expectStatus(200).parse(createdBookingSchema);

    const found = (await bookings.list({ firstname: booking.firstname, lastname: booking.lastname }))
      .expectStatus(200)
      .parse(bookingIdsSchema);

    expect(found).toEqual([{ bookingid: created.bookingid }]);
    await adminBookings.delete(created.bookingid);
  });

  test('filtering by a name nobody has returns an empty list', async ({ bookings }) => {
    const found = (await bookings.list({ lastname: `Nobody${uniqueSuffix()}` })).expectStatus(200).parse(bookingIdsSchema);

    expect(found).toEqual([]);
  });
});
