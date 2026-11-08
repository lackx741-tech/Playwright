import { playwrightConfig, type PlaywrightConfig } from '../../config/playwright.js';
import { BrowserManager } from './BrowserManager.js';
import { ResourceCollector } from './ResourceCollector.js';
import type { Page } from 'playwright';

export interface LoadOptions {
  waitUntil?: 'load' | 'domcontentloaded' | 'networkidle' | 'commit';
  waitForSelector?: string;
  timeoutMs?: number;
}

export interface LoadedPage {
  url: string;
  html: string;
  title: string;
  resources: ReturnType<ResourceCollector['collect']>;
}

export class PageLoader {
  private readonly collector = new ResourceCollector();

  constructor(
    private readonly browsers: BrowserManager = new BrowserManager(),
    private readonly config: PlaywrightConfig = playwrightConfig,
  ) {}

  async load(url: string, options: LoadOptions = {}): Promise<LoadedPage> {
    const context = await this.browsers.createContext();
    const page = await context.newPage();
    try {
      return await this.loadInPage(page, url, options);
    } finally {
      await page.close().catch(() => undefined);
    }
  }

  async shutdown(): Promise<void> {
    await this.browsers.close();
  }

  async loadInPage(page: Page, url: string, options: LoadOptions = {}): Promise<LoadedPage> {
    await page.goto(url, {
      waitUntil: options.waitUntil ?? 'networkidle',
      timeout: options.timeoutMs ?? this.config.navigationTimeoutMs,
    });
    if (options.waitForSelector) {
      await page.waitForSelector(options.waitForSelector, { timeout: options.timeoutMs ?? this.config.actionTimeoutMs });
    }
    const html = await page.content();
    const title = await page.title();
    return { url: page.url(), html, title, resources: this.collector.collect(html, page.url()) };
  }
}
