import { expect as baseExpect } from '@playwright/test';

/**
 * Custom assertions shared by every adapter. Add a matcher here when the same
 * multi-line check starts to appear in more than one test.
 */
export const expect = baseExpect.extend({
  /** Assert that an array of numbers or strings is in order. */
  toBeSorted(received: Array<number | string>, options: { descending?: boolean } = {}) {
    const direction = options.descending ? -1 : 1;
    const compare = (a: number | string, b: number | string): number =>
      (typeof a === 'number' && typeof b === 'number' ? a - b : String(a).localeCompare(String(b))) * direction;

    const firstBreak = received.findIndex((value, index) => index > 0 && compare(received[index - 1]!, value) > 0);
    const pass = firstBreak === -1;
    const order = options.descending ? 'descending' : 'ascending';

    return {
      pass,
      name: 'toBeSorted',
      message: () =>
        pass
          ? `Expected list not to be in ${order} order: ${JSON.stringify(received)}`
          : `Expected list to be in ${order} order, but "${received[firstBreak]}" comes after "${received[firstBreak - 1]}" at position ${firstBreak}:\n${JSON.stringify(received)}`,
    };
  },
});
