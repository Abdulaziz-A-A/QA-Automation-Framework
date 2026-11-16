import { bookingFactory } from '../../data/booking.factory';
import { env } from '../../env';
import { test } from '../../fixtures';

/**
 * Known defects, kept as executable tests.
 *
 * Each test states the CORRECT behaviour and is marked `test.fail()`: it is expected
 * to fail while the defect exists, so the suite stays green and the defect stays visible
 * in every report. The day the defect is fixed the test "passes unexpectedly", the run
 * goes red, and that is the signal to remove the marker and close the ticket.
 */
test.describe('Known defects', { tag: ['@regression', '@api'] }, () => {
  test(
    'creating a booking without required fields is rejected with 400',
    { annotation: { type: 'defect', description: 'Service answers 500 Internal Server Error instead of 400 Bad Request' } },
    async ({ bookings }) => {
      test.fail();
      const { lastname: _omitted, ...incomplete } = bookingFactory.build();

      (await bookings.create(incomplete)).expectStatus(400);
    },
  );

  test(
    'wrong credentials are rejected with 401',
    { annotation: { type: 'defect', description: 'Service answers 200 OK with {"reason":"Bad credentials"} instead of 401 Unauthorized' } },
    async ({ bookings }) => {
      test.fail();

      (await bookings.createToken(env.RESTFUL_BOOKER_USERNAME, 'not-the-password')).expectStatus(401);
    },
  );
});
