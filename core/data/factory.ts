import { faker } from '@faker-js/faker';
import { coreEnv } from '../config/env';

/**
 * One seed per run. Set FAKER_SEED to replay the exact data of a failed run;
 * otherwise a random seed is used and printed once so it can be reused.
 */
export const dataSeed: number = coreEnv.FAKER_SEED ?? Math.floor(Math.random() * 1_000_000);
faker.seed(dataSeed + Number(process.env.TEST_PARALLEL_INDEX ?? 0));

export { faker };

export interface Factory<T> {
  /** Build one object. Pass only the fields the test cares about. */
  build(overrides?: Partial<T>): T;
  /** Build several different objects. */
  buildList(count: number, overrides?: Partial<T>): T[];
}

/**
 * Test-data factory. Describe a valid object once, then override per test:
 *
 *   const userFactory = defineFactory<User>(() => ({ name: faker.person.fullName(), age: 30 }));
 *   const minor = userFactory.build({ age: 15 });
 *
 * Tests then state only what matters to them and stay valid when the model grows.
 */
export function defineFactory<T extends object>(builder: () => T): Factory<T> {
  const build = (overrides: Partial<T> = {}): T => ({ ...builder(), ...overrides });
  return {
    build,
    buildList: (count, overrides) => Array.from({ length: count }, () => build(overrides)),
  };
}

/** A short unique suffix for records created on shared environments. */
export const uniqueSuffix = (): string => `${Date.now().toString(36)}${faker.string.alphanumeric(4).toLowerCase()}`;
