import { z } from 'zod';

/**
 * The API contract, written once. `z.strictObject` also rejects unexpected extra
 * fields, so a silently added or renamed property fails the contract check.
 */
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'expected a YYYY-MM-DD date');

export const bookingSchema = z.strictObject({
  firstname: z.string(),
  lastname: z.string(),
  totalprice: z.number().int().nonnegative(),
  depositpaid: z.boolean(),
  bookingdates: z.strictObject({ checkin: isoDate, checkout: isoDate }),
  additionalneeds: z.string().optional(),
});

export const createdBookingSchema = z.strictObject({
  bookingid: z.number().int().positive(),
  booking: bookingSchema,
});

export const bookingIdsSchema = z.array(z.strictObject({ bookingid: z.number().int().positive() }));

export const tokenSchema = z.strictObject({ token: z.string().min(1) });

export const authFailureSchema = z.strictObject({ reason: z.string() });

export type Booking = z.infer<typeof bookingSchema>;
