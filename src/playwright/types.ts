import type { Browser, BrowserContext, Page } from 'playwright';

export interface BrowserLike {
  newContext(options?: Record<string, unknown>): Promise<BrowserContext>;
  close(): Promise<void>;
}

export type { Browser, BrowserContext, Page };
