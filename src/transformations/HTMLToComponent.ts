import { ComponentDetector } from '../components/ComponentDetector.js';
import { ComponentFactory } from '../components/ComponentFactory.js';
import type { ComponentInstance, DetectedComponent, ParsedDocument } from '../core/types.js';

export interface ConversionResult {
  instances: ComponentInstance[];
  detected: DetectedComponent[];
  unmapped: DetectedComponent[];
}

export class HTMLToComponent {
  constructor(
    private readonly detector = new ComponentDetector(),
    private readonly factory = new ComponentFactory(),
  ) {}

  convert(document: ParsedDocument): ConversionResult {
    const detected = this.detector.detect(document);
    const instances = this.factory.fromDetected(detected);
    const mapped = new Set(instances.map((instance) => instance.type));
    const unmapped = detected.filter((item) => !mapped.has(item.type));
    return { instances, detected, unmapped };
  }
}
