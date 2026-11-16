import { defineFactory, faker } from '@core';
import type { Booking } from '../api/schemas';

const isoDate = (date: Date): string => date.toISOString().slice(0, 10);

/** A valid booking: a stay of 1 to 14 nights starting within the next year. */
export const bookingFactory = defineFactory<Booking>(() => {
  const checkin = faker.date.soon({ days: 365 });
  const checkout = new Date(checkin.getTime() + faker.number.int({ min: 1, max: 14 }) * 86_400_000);

  return {
    firstname: faker.person.firstName(),
    lastname: faker.person.lastName(),
    totalprice: faker.number.int({ min: 50, max: 5000 }),
    depositpaid: faker.datatype.boolean(),
    bookingdates: { checkin: isoDate(checkin), checkout: isoDate(checkout) },
    additionalneeds: faker.helpers.arrayElement(['Breakfast', 'Late checkout', 'Airport transfer', 'Extra bed']),
  };
});
