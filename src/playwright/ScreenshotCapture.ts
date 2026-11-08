import { BrowserManager } from './BrowserManager.js';
import { playwrightConfig, type PlaywrightConfig } from '../../config/playwright.js';
import path from 'node:path';
import { mkdir, writeFile } from 'node:fs/promises';

export interface ScreenshotOptions {
  outputDir?: string;
  fileName?: string;
  fullPage?: boolean;
}

export class ScreenshotCapture {
  constructor(
    private readonly browsers: BrowserManager = new BrowserManager(),
    private readonly config: PlaywrightConfig = playwrightConfig,
  ) {}

  async capture(url: string, options: ScreenshotOptions = {}): Promise<string> {
    const context = await this.browsers.createContext();
    const page = await context.newPage();
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: this.config.navigationTimeoutMs });
      return await this.captureInPage(page, options);
    } finally {
      await page.close().catch(() => undefined);
    }
  }

  async shutdown(): Promise<void> {
    await this.browsers.close();
  }

  async captureInPage(page: { screenshot: (o: { fullPage: boolean }) => Promise<Buffer> }, options: ScreenshotOptions = {}): Promise<string> {
    const outputDir = options.outputDir ?? 'public/previews';
    await mkdir(outputDir, { recursive: true });
    const fileName = options.fileName ?? `preview-${Date.now()}.png`;
    const target = path.join(outputDir, fileName);
    const buffer = await page.screenshot({ fullPage: options.fullPage ?? true });
    await writeFile(target, buffer);
    return target;
  }
}
