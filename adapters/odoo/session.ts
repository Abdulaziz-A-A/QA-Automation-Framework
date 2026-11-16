import fs from 'node:fs';
import path from 'node:path';
import { authFile } from '@core';

/**
 * The public demo redirects each new visitor to one of several servers
 * (demo1.odoo.com, demo2.odoo.com, ...). The setup step records which one this
 * run landed on, and the tests then talk to that exact server.
 */
const instanceFile = path.join(path.dirname(authFile('odoo')), 'odoo-instance.json');

export function saveInstanceOrigin(origin: string): void {
  fs.mkdirSync(path.dirname(instanceFile), { recursive: true });
  fs.writeFileSync(instanceFile, JSON.stringify({ origin }, null, 2));
}

export function readInstanceOrigin(): string {
  if (!fs.existsSync(instanceFile)) {
    throw new Error('No Odoo session found. The "odoo-setup" project must run first (it does when you run the odoo project).');
  }
  return (JSON.parse(fs.readFileSync(instanceFile, 'utf8')) as { origin: string }).origin;
}
