#!/usr/bin/env node
/**
 * Print a short Markdown summary of the last run from reports/json/results.json.
 * In CI it is appended to the job summary page:  node scripts/summary.mjs "title" >> "$GITHUB_STEP_SUMMARY"
 */
import fs from 'node:fs';

const title = process.argv[2] ?? 'Test run';
const file = 'reports/json/results.json';

if (!fs.existsSync(file)) {
  console.log(`### ${title}\n\nNo results file was produced (the run stopped before any test started).`);
  process.exit(0);
}

const report = JSON.parse(fs.readFileSync(file, 'utf8'));
const { expected = 0, unexpected = 0, flaky = 0, skipped = 0, duration = 0 } = report.stats ?? {};

const failures = [];
const defects = [];
const visit = (suite, trail) => {
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests ?? []) {
      const name = [...trail, spec.title].join(' > ');
      if (test.status === 'unexpected') failures.push(name);
      for (const annotation of test.annotations ?? []) {
        if (annotation.type === 'defect') defects.push(`${name}: ${annotation.description}`);
      }
    }
  }
  for (const child of suite.suites ?? []) visit(child, child.file === child.title ? trail : [...trail, child.title]);
};
for (const suite of report.suites ?? []) visit(suite, []);

const lines = [
  `### ${title}: ${unexpected === 0 ? 'passed' : 'FAILED'}`,
  '',
  '| Passed | Failed | Flaky | Skipped | Duration |',
  '| ---: | ---: | ---: | ---: | ---: |',
  `| ${expected} | ${unexpected} | ${flaky} | ${skipped} | ${(duration / 1000).toFixed(1)}s |`,
];
if (failures.length > 0) lines.push('', '**Failed tests**', ...failures.map((name) => `- ${name}`));
if (defects.length > 0) lines.push('', '**Known defects still open**', ...defects.map((name) => `- ${name}`));

console.log(lines.join('\n'));
