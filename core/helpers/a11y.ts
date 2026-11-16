import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, type TestInfo } from '@playwright/test';

export type Impact = 'minor' | 'moderate' | 'serious' | 'critical';
const impactOrder: Impact[] = ['minor', 'moderate', 'serious', 'critical'];

export interface A11yOptions {
  /** WCAG rule sets to check. Default: WCAG 2.0/2.1 levels A and AA. */
  tags?: string[];
  /** Fail only on violations at or above this impact. Default: `serious`. */
  minImpact?: Impact;
  /** CSS selectors to leave out of the scan (third-party widgets and so on). */
  exclude?: string[];
  /**
   * Known, accepted violations: axe rule id -> the reason or ticket.
   * They stay visible in the report but do not fail the build, so accessibility
   * debt is written down instead of silently ignored.
   */
  knownIssues?: Record<string, string>;
}

/**
 * Scan the current page with axe-core, attach the full result to the report
 * and fail on any new violation at or above the chosen impact.
 */
export async function checkA11y(page: Page, testInfo: TestInfo, options: A11yOptions = {}): Promise<void> {
  const { tags = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'], minImpact = 'serious', exclude = [], knownIssues = {} } = options;

  let builder = new AxeBuilder({ page }).withTags(tags);
  for (const selector of exclude) builder = builder.exclude(selector);
  const results = await builder.analyze();

  const summary = results.violations.map((violation) => ({
    rule: violation.id,
    impact: violation.impact ?? 'minor',
    help: violation.help,
    helpUrl: violation.helpUrl,
    known: knownIssues[violation.id] ?? null,
    elements: violation.nodes.map((node) => node.target.join(' ')),
  }));

  await testInfo.attach('accessibility-violations.json', {
    body: JSON.stringify(summary, null, 2),
    contentType: 'application/json',
  });

  const threshold = impactOrder.indexOf(minImpact);
  const blocking = summary.filter(
    (violation) => impactOrder.indexOf(violation.impact as Impact) >= threshold && violation.known === null,
  );

  for (const violation of summary.filter((entry) => entry.known !== null)) {
    testInfo.annotations.push({ type: 'known a11y issue', description: `${violation.rule}: ${violation.known}` });
  }

  expect(
    blocking.map((violation) => `${violation.impact} | ${violation.rule}: ${violation.help} (${violation.elements.length} element(s))`),
    `New accessibility violations at "${minImpact}" impact or above on ${page.url()}`,
  ).toEqual([]);
}
