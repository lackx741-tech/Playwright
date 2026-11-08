import { playwrightConfig, type PlaywrightConfig } from '../../config/playwright.js';
import type { Browser, BrowserContext } from 'playwright';

export class BrowserUnavailableError extends Error {
  constructor(cause: unknown) {
    super(
      'Playwright is not available. Install it with `npm install playwright` and `npx playwright install chromium`.',
    );
    this.name = 'BrowserUnavailableError';
    this.cause = cause;
  }
}

export class BrowserManager {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;

  constructor(private readonly config: PlaywrightConfig = playwrightConfig) {}

  async launch(): Promise<Browser> {
    if (this.browser) return this.browser;
    let chromium;
    try {
      ({ chromium } = await import('playwright'));
    } catch (error) {
      throw new BrowserUnavailableError(error);
    }
    this.browser = await chromium.launch({ headless: this.config.headless });
    return this.browser;
  }

  async createContext(): Promise<BrowserContext> {
    if (this.context) return this.context;
    const browser = await this.launch();
    this.context = await browser.newContext({
      viewport: this.config.viewport,
      userAgent: this.config.userAgent ?? undefined,
    });
    this.context.setDefaultNavigationTimeout(this.config.navigationTimeoutMs);
    this.context.setDefaultTimeout(this.config.actionTimeoutMs);
    return this.context;
  }

  isRunning(): boolean {
    return this.browser !== null;
  }

  async close(): Promise<void> {
    if (this.context) {
      await this.context.close().catch(() => undefined);
      this.context = null;
    }
    if (this.browser) {
      await this.browser.close().catch(() => undefined);
      this.browser = null;
    }
  }
}
