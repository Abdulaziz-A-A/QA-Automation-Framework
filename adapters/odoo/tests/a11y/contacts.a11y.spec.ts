import { test } from '../../fixtures';

/**
 * Accessibility debt that already exists in the product, written down rule by rule.
 * These are reported on the test as "known a11y issue" annotations and do not fail it;
 * any violation NOT listed here does. On a real project each value would be a ticket id.
 */
const KNOWN_ISSUES = {
  'aria-allowed-attr': 'Existing in Odoo list view: unsupported ARIA attributes',
  'aria-required-children': 'Existing in Odoo list view: ARIA roles missing required children',
  'button-name': 'Existing in Odoo control panel: icon-only buttons without a name',
  'html-has-lang': 'Existing in Odoo web client: <html> has no lang attribute',
  label: 'Existing in Odoo list view: row checkboxes without labels',
  'label-content-name-mismatch': 'Existing in Odoo control panel: visible text missing from accessible name',
  'role-img-alt': 'Existing in Odoo list view: avatar images without alternative text',
};

test('contacts list has no new serious WCAG A/AA violations', { tag: ['@a11y'] }, async ({ contactsPage, a11y }) => {
  await contactsPage.goto();
  await a11y.check({ knownIssues: KNOWN_ISSUES });
});
