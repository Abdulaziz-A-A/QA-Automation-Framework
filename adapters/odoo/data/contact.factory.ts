import { defineFactory, faker, uniqueSuffix } from '@core';

export interface Contact {
  name: string;
  email: string;
  phone: string;
}

/** Contacts get a unique, recognisable name so tests never collide on a shared server. */
export const contactFactory = defineFactory<Contact>(() => {
  const suffix = uniqueSuffix();
  return {
    name: `QA Auto ${faker.person.lastName()} ${suffix}`,
    email: `qa.auto.${suffix}@example.com`,
    phone: faker.string.numeric({ length: 9, allowLeadingZeros: false }),
  };
});
