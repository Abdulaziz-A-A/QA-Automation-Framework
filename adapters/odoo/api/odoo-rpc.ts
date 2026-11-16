import { expect, test, type APIRequestContext } from '@playwright/test';

/**
 * Odoo's JSON-RPC interface, called with the same signed-in session as the browser.
 *
 * UI tests use it for everything that is NOT the behaviour under test: seeding
 * records, checking what was really stored, and cleaning up. That keeps each test
 * short, fast and focused on one screen.
 */
export class OdooRpc {
  constructor(
    private readonly request: APIRequestContext,
    private readonly origin: string,
  ) {}

  call<Result>(model: string, method: string, args: unknown[] = [], kwargs: Record<string, unknown> = {}): Promise<Result> {
    return test.step(`RPC ${model}.${method}`, async () => {
      const response = await this.request.post(`${this.origin}/web/dataset/call_kw/${model}/${method}`, {
        data: { jsonrpc: '2.0', method: 'call', params: { model, method, args, kwargs } },
      });
      expect(response.status(), `RPC ${model}.${method} HTTP status`).toBe(200);

      const body = (await response.json()) as { result?: Result; error?: { data?: { message?: string }; message?: string } };
      if (body.error) {
        throw new Error(`RPC ${model}.${method} failed: ${body.error.data?.message ?? body.error.message ?? 'unknown error'}`);
      }
      return body.result as Result;
    });
  }

  create = (model: string, values: Record<string, unknown>): Promise<number> =>
    this.call<number[]>(model, 'create', [[values]]).then((ids) => ids[0]!);

  searchRead = <Row>(model: string, domain: unknown[], fields: string[]): Promise<Row[]> =>
    this.call<Row[]>(model, 'search_read', [domain], { fields });

  searchCount = (model: string, domain: unknown[]): Promise<number> => this.call<number>(model, 'search_count', [domain]);

  unlink = (model: string, ids: number[]): Promise<boolean> => this.call<boolean>(model, 'unlink', [ids]);
}
