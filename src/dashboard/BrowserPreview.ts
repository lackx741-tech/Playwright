import { PageLoader } from '../playwright/PageLoader.js';
import { ScreenshotCapture } from '../playwright/ScreenshotCapture.js';
import { DOMSnapshotFactory } from '../playwright/DOMSnapshot.js';
import { URLValidator } from '../security/URLValidator.js';
import type { DOMSnapshot } from '../core/types.js';

export class BrowserPreview {
  constructor(
    private readonly loader = new PageLoader(),
    private readonly screenshots = new ScreenshotCapture(),
    private readonly snapshots = new DOMSnapshotFactory(),
    private readonly urls = new URLValidator(),
  ) {}

  async capture(url: string, options: { screenshot?: boolean } = {}): Promise<DOMSnapshot> {
    const safeUrl = this.urls.assertAllowed(url);
    const loaded = await this.loader.load(safeUrl);
    const screenshotPath = options.screenshot ? await this.screenshots.capture(safeUrl) : null;
    return this.snapshots.create(loaded.url, loaded.html, loaded.title, screenshotPath);
  }
}
