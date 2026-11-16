import { bookingSchema, createdBookingSchema } from '../../api/schemas';
import { bookingFactory } from '../../data/booking.factory';
import { expect, test } from '../../fixtures';

test.describe('Booking lifecycle', { tag: ['@regression', '@api'] }, () => {
  test('creating a booking returns an id and echoes what was sent', async ({ bookings, adminBookings }) => {
    const booking = bookingFactory.build();

    const created = (await bookings.create(booking)).expectStatus(200).parse(createdBookingSchema);

    expect(created.booking).toEqual(booking);
    await adminBookings.delete(created.bookingid);
  });

  test('a created booking can be read back unchanged', async ({ bookings, existingBooking }) => {
    const fetched = (await bookings.get(existingBooking.id)).expectStatus(200).parse(bookingSchema);

    expect(fetched).toEqual(existingBooking.data);
  });

  test('a booking without optional needs is accepted', async ({ bookings, adminBookings }) => {
    const { additionalneeds: _omitted, ...booking } = bookingFactory.build();

    const created = (await bookings.create(booking)).expectStatus(200).parse(createdBookingSchema);

    expect(created.booking).toEqual(booking);
    await adminBookings.delete(created.bookingid);
  });

  test('a full update replaces every field', async ({ bookings, adminBookings, existingBooking }) => {
    const replacement = bookingFactory.build();

    const updated = (await adminBookings.update(existingBooking.id, replacement)).expectStatus(200).parse(bookingSchema);
    expect(updated).toEqual(replacement);

    const fetched = (await bookings.get(existingBooking.id)).expectStatus(200).parse(bookingSchema);
    expect(fetched, 'the change is persisted, not only echoed').toEqual(replacement);
  });

  test('a partial update changes only the fields sent', async ({ bookings, adminBookings, existingBooking }) => {
    const changes = { firstname: 'Updated', totalprice: existingBooking.data.totalprice + 100 };

    (await adminBookings.patch(existingBooking.id, changes)).expectStatus(200).parse(bookingSchema);

    const fetched = (await bookings.get(existingBooking.id)).expectStatus(200).parse(bookingSchema);
    expect(fetched).toEqual({ ...existingBooking.data, ...changes });
  });

  test('a deleted booking can no longer be read', async ({ bookings, adminBookings, existingBooking }) => {
    // This service answers 201 Created to a successful delete.
    (await adminBookings.delete(existingBooking.id)).expectStatus(201);

    (await bookings.get(existingBooking.id)).expectStatus(404);
  });

  test('reading a booking that does not exist returns 404', async ({ bookings }) => {
    (await bookings.get(999_999_999)).expectStatus(404);
  });
});
