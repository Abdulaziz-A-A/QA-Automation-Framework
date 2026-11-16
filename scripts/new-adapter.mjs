#!/usr/bin/env node
/**
 * Scaffold a new adapter from adapters/_template and register it.
 *
 *   npm run new:adapter -- my-app            # browser (UI) adapter
 *   npm run new:adapter -- billing-api --api # API-only adapter
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [name, ...flags] = process.argv.slice(2);
const isApi = flags.includes('--api');

if (!name || !/^[a-z][a-z0-9-]*$/.test(name)) {
  console.error('Usage: npm run new:adapter -- <name> [--api]\nThe name must be lower-case letters, digits and dashes, e.g. "my-app".');
  process.exit(1);
}

const source = path.join(root, 'adapters', '_template');
const target = path.join(root, 'adapters', name);
if (fs.existsSync(target)) {
  console.error(`adapters/${name} already exists.`);
  process.exit(1);
}

const words = name.split('-');
const pascal = words.map((word) => word[0].toUpperCase() + word.slice(1)).join('');
const camel = pascal[0].toLowerCase() + pascal.slice(1);
const constant = name.replaceAll('-', '_').toUpperCase();

const rewrite = (text) =>
  text
    .replaceAll('TEMPLATE_', `${constant}_`)
    .replaceAll('TemplateFixtures', `${pascal}Fixtures`)
    .replaceAll("name: 'template'", `name: '${name}'`)
    .replaceAll("kind: 'ui'", `kind: '${isApi ? 'api' : 'ui'}'`);

const copy = (from, to) => {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    const fromPath = path.join(from, entry.name);
    const toPath = path.join(to, entry.name);
    if (entry.isDirectory()) copy(fromPath, toPath);
    else fs.writeFileSync(toPath, rewrite(fs.readFileSync(fromPath, 'utf8')));
  }
};
copy(source, target);

if (isApi) {
  // An API adapter has no pages: replace the page-object example with an API example.
  fs.rmSync(path.join(target, 'pages'), { recursive: true });
  fs.writeFileSync(
    path.join(target, 'fixtures.ts'),
    "import { test as base } from '@core';\n\n/** This adapter's `test`. Add typed API clients here as fixtures (see adapters/restful-booker). */\nexport const test = base.extend({});\n\nexport { expect } from '@core';\n",
  );
  fs.rmSync(path.join(target, 'tests', 'smoke', 'home.spec.ts'));
  fs.writeFileSync(
    path.join(target, 'tests', 'smoke', 'health.spec.ts'),
    "import { expect, test } from '../../fixtures';\n\ntest('the API answers', { tag: ['@smoke', '@api'] }, async ({ api }) => {\n  const response = await api.get('/');\n\n  expect(response.status).toBeLessThan(500);\n});\n",
  );
}

// Register the adapter in adapters/index.ts
const registryPath = path.join(root, 'adapters', 'index.ts');
const marker = '  // new adapters are registered above this line';
let registry = fs.readFileSync(registryPath, 'utf8');
if (!registry.includes(marker)) {
  console.error(`Created adapters/${name}, but could not find the registration marker in adapters/index.ts. Register it by hand.`);
  process.exit(1);
}
const lastImport = [...registry.matchAll(/^import .*;$/gm)].pop();
const insertAt = lastImport.index + lastImport[0].length;
registry = `${registry.slice(0, insertAt)}\nimport ${camel} from './${name}/adapter.config';${registry.slice(insertAt)}`;
registry = registry.replace(marker, `  ${camel},\n${marker}`);
fs.writeFileSync(registryPath, registry);

// Document the new variables
fs.appendFileSync(
  path.join(root, '.env.example'),
  `\n# --- ${name} adapter (${isApi ? 'API' : 'UI'}) ---\n${constant}_BASE_URL=https://example.com\n${constant}_USERNAME=\n${constant}_PASSWORD=\n`,
);

console.log(`Created adapters/${name} (${isApi ? 'API' : 'UI'}) and registered it.

Next steps:
  1. Set ${constant}_BASE_URL in .env
  2. Run it:   npx playwright test --project="${name}*"
  3. Replace the example ${isApi ? 'health test with real API tests' : 'page object and test with real ones'}`);
