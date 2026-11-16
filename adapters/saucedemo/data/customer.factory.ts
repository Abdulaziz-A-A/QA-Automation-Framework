import { defineFactory, faker } from '@core';

export interface Customer {
  firstName: string;
  lastName: string;
  postalCode: string;
}

export const customerFactory = defineFactory<Customer>(() => ({
  firstName: faker.person.firstName(),
  lastName: faker.person.lastName(),
  postalCode: faker.location.zipCode('#####'),
}));
