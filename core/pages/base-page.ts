import type { Locator, Page } from '@playwright/test';

/**
 * Base class for page objects.
 *
 * A page object answers two questions about one screen and nothing else:
 *   1. where are the elements?  (locators, kept in one place)
 *   2. what can a user do here? (methods named after user intent)
 * Assertions stay in the tests, except `expectLoaded`, the page's own "am I here?" check.
 */
export abstract class BasePage {
  /** Path relative to the adapter's baseURL, when the page has a stable one. */
  protected readonly path: string | undefined = undefined;

  constructor(protected readonly page: Page) {}

  /** Open the page by URL and wait until it is ready. */
  async goto(): Promise<this> {
    if (this.path === undefined) {
      throw new Error(`${this.constructor.name} has no path; reach it through the UI instead.`);
    }
    await this.page.goto(this.path);
    await this.expectLoaded();
    return this;
  }

  /** Each page states how to recognise that it is fully displayed. */
  abstract expectLoaded(): Promise<void>;

  get url(): string {
    return this.page.url();
  }
}

/** Base class for a reusable part of a page (header, search box, data table...). */
export abstract class BaseComponent {
  constructor(
    protected readonly page: Page,
    protected readonly root: Locator,
  ) {}
}
