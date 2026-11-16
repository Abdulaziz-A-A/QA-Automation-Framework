import { ApiClient, createLogger, test as base } from '@core';
import { BookingClient } from './api/booking.client';
import { createdBookingSchema, tokenSchema, type Booking } from './api/schemas';
import { bookingFactory } from './data/booking.factory';
import { env } from './env';

interface BookerFixtures {
  /** Anonymous client: what any caller can do. */
  bookings: BookingClient;
  /** Client carrying the admin token: may update and delete. */
  adminBookings: BookingClient;
  /** A booking created for this test and deleted afterwards, whatever the test does to it. */
  existingBooking: { id: number; data: Booking };
}

interface BookerWorkerFixtures {
  /** The admin token is requested once per worker, not once per test. */
  adminToken: string;
}

export const test = base.extend<BookerFixtures, BookerWorkerFixtures>({
  adminToken: [
    async ({ playwright }, use, workerInfo) => {
      const request = await playwright.request.newContext(workerInfo.project.use);
      const client = new BookingClient(new ApiClient(request, createLogger({ title: 'admin token' })));
      const response = await client.createToken(env.RESTFUL_BOOKER_USERNAME, env.RESTFUL_BOOKER_PASSWORD);
      const { token } = response.expectStatus(200).parse(tokenSchema);
      await request.dispose();
      await use(token);
    },
    { scope: 'worker' },
  ],

  bookings: async ({ api }, use) => use(new BookingClient(api)),

  adminBookings: async ({ bookings, adminToken }, use) => use(bookings.authorizedWith(adminToken)),

  existingBooking: async ({ bookings, adminBookings }, use) => {
    const data = bookingFactory.build();
    const created = (await bookings.create(data)).expectStatus(200).parse(createdBookingSchema);

    await use({ id: created.bookingid, data });

    // Clean up. The test may already have deleted it, so any answer is acceptable here.
    await adminBookings.delete(created.bookingid);
  },
});

export { expect } from '@core';
