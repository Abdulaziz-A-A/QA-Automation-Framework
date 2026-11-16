import type { TestInfo } from '@playwright/test';

export interface Logger {
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  /** Everything logged so far, one line per entry. */
  dump(): string;
}

/**
 * A tiny per-test logger. Lines are kept in memory and attached to the HTML
 * report by the `log` fixture, so each test carries its own readable timeline
 * instead of one interleaved console stream across parallel workers.
 */
export function createLogger(testInfo: Pick<TestInfo, 'title'>): Logger {
  const lines: string[] = [];
  const started = Date.now();

  const write = (level: 'INFO' | 'WARN', message: string, data?: unknown): void => {
    const elapsed = `${String(Date.now() - started).padStart(6, ' ')}ms`;
    const suffix = data === undefined ? '' : ` ${safeJson(data)}`;
    const line = `[${elapsed}] ${level} ${message}${suffix}`;
    lines.push(line);
    if (process.env.DEBUG_LOGS) console.log(`(${testInfo.title}) ${line}`);
  };

  return {
    info: (message, data) => write('INFO', message, data),
    warn: (message, data) => write('WARN', message, data),
    dump: () => lines.join('\n'),
  };
}

const SECRET_KEY = /pass(word)?|token|secret|authorization|cookie/i;

/** JSON for logs: secrets masked, long payloads trimmed. */
export function safeJson(value: unknown, maxLength = 2000): string {
  let text: string;
  try {
    text = JSON.stringify(value, (key, inner: unknown) => (SECRET_KEY.test(key) ? '***' : inner));
  } catch {
    text = String(value);
  }
  return text.length > maxLength ? `${text.slice(0, maxLength)}... (${text.length} chars)` : text;
}
