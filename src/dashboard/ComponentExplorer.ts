import { ComponentRegistry } from '../components/ComponentRegistry.js';
import { ComponentDetector } from '../components/ComponentDetector.js';
import { HTMLParser } from '../cheerio/HTMLParser.js';
import type { DetectedComponent } from '../core/types.js';

export class ComponentExplorer {
  constructor(
    private readonly registry = new ComponentRegistry(),
    private readonly detector = new ComponentDetector(),
    private readonly parser = new HTMLParser(),
  ) {}

  catalog() {
    return this.registry.list().map((definition) => definition.schema);
  }

  detect(html: string): DetectedComponent[] {
    return this.detector.detect(this.parser.parse(html));
  }
}
