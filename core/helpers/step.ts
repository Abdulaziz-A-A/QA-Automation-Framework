import { test } from '@playwright/test';

/**
 * Method decorator: wraps a page-object or API-client method in `test.step`, so the
 * HTML report and trace read like a test case ("LoginPage.login", "CartPage.checkout")
 * instead of a wall of raw clicks.
 *
 *   class LoginPage {
 *     @step()
 *     async login(user: string, password: string) { ... }
 *   }
 */
export function step(label?: string) {
  return function decorator<This extends object, Args extends unknown[], Return>(
    target: (this: This, ...args: Args) => Promise<Return>,
    context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Promise<Return>>,
  ) {
    return function replacement(this: This, ...args: Args): Promise<Return> {
      const name = label ?? `${this.constructor.name}.${String(context.name)}`;
      return test.step(name, () => target.call(this, ...args), { box: true });
    };
  };
}
