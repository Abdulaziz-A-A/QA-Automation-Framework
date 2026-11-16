import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { z } from 'zod';
import { ApiResponse, checkA11y, defineAdapter, defineFactory, expect, safeJson, test, toProjects } from '@core';

/**
 * Tests of the framework itself. They need no external site, so they prove that
 * the shared building blocks work (and really do fail when they should) before
 * any application test relies on them.
 */
test.describe('core: custom matchers', { tag: ['@selftest'] }, () => {
  test('toBeSorted accepts ordered lists and rejects unordered ones', () => {
    expect([1, 2, 2, 10]).toBeSorted();
    expect(['c', 'b', 'a']).toBeSorted({ descending: true });
    expect([3, 1, 2]).not.toBeSorted();
    expect(() => expect([9.99, 7.99, 15.99]).toBeSorted()).toThrow(/"7.99" comes after "9.99"/);
  });
});

test.describe('core: data factory', { tag: ['@selftest'] }, () => {
  const factory = defineFactory(() => ({ id: Math.random(), role: 'viewer', active: true }));

  test('build applies overrides and keeps the other defaults', () => {
    expect(factory.build({ role: 'admin' })).toMatchObject({ role: 'admin', active: true });
  });

  test('buildList returns distinct objects', () => {
    const list = factory.buildList(3);
    expect(new Set(list.map((item) => item.id)).size).toBe(3);
  });
});

test.describe('core: adapter model', { tag: ['@selftest'] }, () => {
  test('a ui adapter with auth becomes a setup project plus one project per browser', () => {
    const adapter = defineAdapter({ name: 'shop', kind: 'ui', baseURL: 'https://shop.example', auth: true });
    const projects = toProjects([adapter]);

    expect(projects.map((project) => project.name)).toEqual(expect.arrayContaining(['shop-setup', 'shop-chromium']));
    const browserProject = projects.find((project) => project.name === 'shop-chromium');
    expect(browserProject?.dependencies).toEqual(['shop-setup']);
    expect(browserProject?.use?.baseURL).toBe('https://shop.example');
  });

  test('an api adapter becomes a single browser-less project', () => {
    const projects = toProjects([defineAdapter({ name: 'orders-api', kind: 'api', baseURL: 'https://api.example' })]);

    expect(projects.map((project) => project.name)).toEqual(['orders-api']);
  });

  test('invalid adapter names are rejected early', () => {
    expect(() => defineAdapter({ name: 'My App', kind: 'ui', baseURL: 'https://x.example' })).toThrow(/lower-case/);
  });
});

test.describe('core: logging', { tag: ['@selftest'] }, () => {
  test('secrets are masked before they reach a log or report', () => {
    const logged = safeJson({ username: 'admin', password: 'hunter2', nested: { accessToken: 'abc', note: 'ok' } });

    expect(logged).not.toContain('hunter2');
    expect(logged).not.toContain('abc');
    expect(logged).toContain('"username":"admin"');
    expect(logged).toContain('"note":"ok"');
  });
});

test.describe('core: API client', { tag: ['@selftest'] }, () => {
  let server: http.Server;
  let origin: string;

  test.beforeAll(async () => {
    server = http.createServer((request, response) => {
      if (request.url?.startsWith('/users/1')) {
        response.writeHead(200, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ id: 1, name: 'Sara', auth: request.headers.authorization ?? null }));
      } else {
        response.writeHead(404, { 'Content-Type': 'text/plain' });
        response.end('Not Found');
      }
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  });

  test.afterAll(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  const userSchema = z.strictObject({ id: z.number(), name: z.string(), auth: z.string().nullable() });

  test('returns status, timing and a typed body', async ({ api }) => {
    const response = await api.get(`${origin}/users/1`);

    const user = response.expectStatus(200).parse(userSchema);
    expect(user).toEqual({ id: 1, name: 'Sara', auth: null });
    expect(response.durationMs).toBeGreaterThanOrEqual(0);
  });

  test('withHeaders sends extra headers without changing the original client', async ({ api }) => {
    const authorized = api.withHeaders({ Authorization: 'Bearer t0ken' });

    expect((await authorized.get(`${origin}/users/1`)).parse(userSchema).auth).toBe('Bearer t0ken');
    expect((await api.get(`${origin}/users/1`)).parse(userSchema).auth).toBeNull();
  });

  test('error statuses are returned, not thrown, so negative tests can assert them', async ({ api }) => {
    const response = await api.get(`${origin}/missing`);

    response.expectStatus(404);
    expect(response.json).toBeUndefined();
    expect(response.text).toBe('Not Found');
  });

  test('a body that breaks the contract fails with the offending field', () => {
    const response = new ApiResponse('GET', '/users/1', 200, {}, JSON.stringify({ id: 'one', name: 'Sara', auth: null, extra: true }), 5);

    expect(() => response.parse(userSchema)).toThrow(/id: .*number/s);
    expect(() => response.parse(userSchema)).toThrow(/extra/);
    expect(() => response.expectStatus(201)).toThrow(/should return 201/);
  });
});

test.describe('core: accessibility check', { tag: ['@selftest'] }, () => {
  const inaccessible = '<html lang="en"><head><title>t</title></head><body><main><h1>Shop</h1><img src="a.png"><button></button></main></body></html>';

  test('a clean page passes', async ({ page, a11y }) => {
    await page.setContent('<html lang="en"><head><title>t</title></head><body><main><h1>Shop</h1><button>Buy</button></main></body></html>');
    await a11y.check();
  });

  test('a page with unlabeled controls fails and names the rules', async ({ page }, testInfo) => {
    await page.setContent(inaccessible);

    await expect(checkA11y(page, testInfo)).rejects.toThrow(/image-alt[\s\S]*button-name|button-name[\s\S]*image-alt/);
  });

  test('known issues are reported as annotations instead of failures', async ({ page }, testInfo) => {
    await page.setContent(inaccessible);

    await checkA11y(page, testInfo, { knownIssues: { 'image-alt': 'TICKET-1', 'button-name': 'TICKET-2' } });
    expect(testInfo.annotations.filter((annotation) => annotation.type === 'known a11y issue')).toHaveLength(2);
  });
});
