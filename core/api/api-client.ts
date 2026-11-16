import { expect, test, type APIRequestContext } from '@playwright/test';
import type { z } from 'zod';
import type { Logger } from '../helpers/logger';

type Method = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface RequestOptions {
  /** Query-string parameters. */
  params?: Record<string, string | number | boolean>;
  /** JSON request body. */
  data?: unknown;
  headers?: Record<string, string>;
}

/**
 * What came back from a call, with the two checks every API test needs:
 * the status code and the shape of the body.
 */
export class ApiResponse {
  constructor(
    readonly method: Method,
    readonly url: string,
    readonly status: number,
    readonly headers: Record<string, string>,
    /** Raw body text, exactly as received. */
    readonly text: string,
    readonly durationMs: number,
  ) {}

  /** Body parsed as JSON, or `undefined` when it is not JSON. */
  get json(): unknown {
    try {
      return JSON.parse(this.text);
    } catch {
      return undefined;
    }
  }

  /** Assert the HTTP status. Returns `this` so checks can be chained. */
  expectStatus(expected: number): this {
    expect(this.status, `${this.method} ${this.url} should return ${expected}. Body: ${this.text.slice(0, 500)}`).toBe(expected);
    return this;
  }

  /**
   * Contract check: validate the body against a zod schema and return it fully typed.
   * A missing field or a wrong type fails with the exact path that broke the contract.
   */
  parse<Schema extends z.ZodType>(schema: Schema): z.infer<Schema> {
    const result = schema.safeParse(this.json);
    if (!result.success) {
      const problems = result.error.issues.map((issue) => `  - ${issue.path.join('.') || '(root)'}: ${issue.message}`).join('\n');
      throw new Error(`${this.method} ${this.url} response does not match the expected schema:\n${problems}\nBody: ${this.text.slice(0, 800)}`);
    }
    return result.data;
  }
}

/**
 * Thin wrapper over Playwright's APIRequestContext. It adds what raw calls lack:
 * a report step per call, timing, request/response logging with secrets masked,
 * and default headers. Adapters build their own typed clients on top of it.
 */
export class ApiClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly log: Logger,
    private readonly defaultHeaders: Record<string, string> = { Accept: 'application/json' },
  ) {}

  /** A copy of this client that sends extra headers on every call (auth tokens and so on). */
  withHeaders(headers: Record<string, string>): ApiClient {
    return new ApiClient(this.request, this.log, { ...this.defaultHeaders, ...headers });
  }

  get = (url: string, options?: RequestOptions) => this.send('GET', url, options);
  post = (url: string, options?: RequestOptions) => this.send('POST', url, options);
  put = (url: string, options?: RequestOptions) => this.send('PUT', url, options);
  patch = (url: string, options?: RequestOptions) => this.send('PATCH', url, options);
  delete = (url: string, options?: RequestOptions) => this.send('DELETE', url, options);

  private send(method: Method, url: string, options: RequestOptions = {}): Promise<ApiResponse> {
    return test.step(`${method} ${url}`, async () => {
      const started = Date.now();
      const response = await this.request.fetch(url, {
        method,
        params: options.params,
        data: options.data,
        headers: { ...this.defaultHeaders, ...options.headers },
        failOnStatusCode: false,
      });
      const text = await response.text();
      const result = new ApiResponse(method, url, response.status(), response.headers(), text, Date.now() - started);

      this.log.info(`${method} ${url} -> ${result.status} (${result.durationMs}ms)`, {
        params: options.params,
        request: options.data,
        response: result.json ?? text.slice(0, 300),
      });
      return result;
    });
  }
}

