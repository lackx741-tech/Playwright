import type { ComponentInstance, ElementNode, ParsedDocument } from '../core/types.js';
import { HTMLToComponent } from './HTMLToComponent.js';

export interface TransformOptions {
  includeText?: boolean;
  maxNodes?: number;
}

export class DOMTransformer {
  constructor(private readonly converter = new HTMLToComponent()) {}

  transform(document: ParsedDocument, options: TransformOptions = {}): ComponentInstance[] {
    const maxNodes = options.maxNodes ?? 500;
    const { instances } = this.converter.convert(document);
    return instances.slice(0, maxNodes);
  }

  flatten(node: ElementNode): ElementNode[] {
    const out: ElementNode[] = [node];
    for (const child of node.children) out.push(...this.flatten(child));
    return out;
  }
}
