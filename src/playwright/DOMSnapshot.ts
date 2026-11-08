import { ResourceCollector } from './ResourceCollector.js';
import type { DOMSnapshot } from '../core/types.js';

export class DOMSnapshotFactory {
  private readonly collector = new ResourceCollector();

  create(url: string, html: string, title = '', screenshotPath: string | null = null): DOMSnapshot {
    return {
      url,
      html,
      title,
      capturedAt: new Date().toISOString(),
      resources: this.collector.collect(html, url),
      screenshotPath,
    };
  }

  serialize(snapshot: DOMSnapshot): string {
    return JSON.stringify(snapshot, null, 2);
  }
}
