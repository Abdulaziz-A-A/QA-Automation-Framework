import type { BookingClient } from '../../api/booking.client';
import { authFailureSchema, bookingSchema, tokenSchema } from '../../api/schemas';
import { bookingFactory } from '../../data/booking.factory';
import { env } from '../../env';
import { expect, test } from '../../fixtures';

test.describe('Authentication and authorization', { tag: ['@regression', '@api'] }, () => {
  test('valid admin credentials produce a token', async ({ bookings }) => {
    const response = await bookings.createToken(env.RESTFUL_BOOKER_USERNAME, env.RESTFUL_BOOKER_PASSWORD);

    response.expectStatus(200).parse(tokenSchema);
  });

  test('wrong credentials produce no token', async ({ bookings }) => {
    const response = await bookings.createToken(env.RESTFUL_BOOKER_USERNAME, 'not-the-password');

    const body = response.parse(authFailureSchema);
    expect(body.reason).toBe('Bad credentials');
  });

  const protectedActions = [
    { name: 'full update', run: (client: BookingClient, id: number) => client.update(id, bookingFactory.build()) },
    { name: 'partial update', run: (client: BookingClient, id: number) => client.patch(id, { firstname: 'Intruder' }) },
    { name: 'delete', run: (client: BookingClient, id: number) => client.delete(id) },
  ];

  for (const action of protectedActions) {
    test(`${action.name} is refused without a token and changes nothing`, async ({ bookings, existingBooking }) => {
      (await action.run(bookings, existingBooking.id)).expectStatus(403);

      const fetched = (await bookings.get(existingBooking.id)).expectStatus(200).parse(bookingSchema);
      expect(fetched).toEqual(existingBooking.data);
    });

    test(`${action.name} is refused with a forged token`, async ({ bookings, existingBooking }) => {
      const forged = bookings.authorizedWith('forged-token-123');

      (await action.run(forged, existingBooking.id)).expectStatus(403);
    });
  }
});
