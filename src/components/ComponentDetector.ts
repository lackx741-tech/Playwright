import { componentsConfig, type ComponentsConfig } from '../../config/components.js';
import { AttributeParser } from '../cheerio/AttributeParser.js';
import type { DetectedComponent, ElementNode, ParsedDocument } from '../core/types.js';

interface Rule {
  type: string;
  test: (node: ElementNode) => boolean;
  confidence: number;
  reason: string;
  map: (node: ElementNode) => Record<string, unknown>;
}

export class ComponentDetector {
  private readonly attributes = new AttributeParser();

  constructor(private readonly config: ComponentsConfig = componentsConfig) {}

  detect(document: ParsedDocument): DetectedComponent[] {
    const detected: DetectedComponent[] = [];
    const visit = (node: ElementNode) => {
      const match = this.match(node);
      if (match && match.confidence >= this.config.minConfidence) detected.push(match);
      for (const child of node.children) visit(child);
    };
    visit(document.root);
    return detected;
  }

  private match(node: ElementNode): DetectedComponent | null {
    for (const rule of this.rules()) {
      if (rule.test(node)) {
        return {
          type: rule.type,
          tagName: node.tagName,
          confidence: rule.confidence,
          selector: node.path,
          properties: rule.map(node),
          reasons: [rule.reason],
        };
      }
    }
    return null;
  }

  private rules(): Rule[] {
    return [
      {
        type: 'button',
        confidence: 0.95,
        reason: 'button element or button-like role',
        test: (n) => n.tagName === 'button' || n.attributes['role'] === 'button' || this.hasClass(n, 'btn'),
        map: (n) => ({ label: n.text || 'Button', href: n.attributes['href'] ?? '' }),
      },
      {
        type: 'navbar',
        confidence: 0.9,
        reason: 'nav element or navigation role',
        test: (n) => n.tagName === 'nav' || n.attributes['role'] === 'navigation' || this.hasClass(n, 'navbar'),
        map: (n) => ({ logo: n.text.slice(0, 40), links: [] }),
      },
      {
        type: 'card',
        confidence: 0.8,
        reason: 'card class or article with heading',
        test: (n) => this.hasClass(n, 'card') || (n.tagName === 'article' && n.children.some((c) => c.tagName.startsWith('h'))),
        map: (n) => ({ title: n.text.slice(0, 60), description: '' }),
      },
      {
        type: 'form',
        confidence: 0.92,
        reason: 'form element',
        test: (n) => n.tagName === 'form',
        map: (n) => ({ action: n.attributes['action'] ?? '', method: (n.attributes['method'] ?? 'post').toLowerCase() }),
      },
      {
        type: 'table',
        confidence: 0.9,
        reason: 'table element',
        test: (n) => n.tagName === 'table',
        map: (n) => ({ columns: [], rows: [], sortable: false }),
      },
      {
        type: 'modal',
        confidence: 0.75,
        reason: 'dialog element or modal class',
        test: (n) => n.tagName === 'dialog' || this.hasClass(n, 'modal') || n.attributes['role'] === 'dialog',
        map: (n) => ({ title: n.text.slice(0, 40), visible: false }),
      },
      {
        type: 'container',
        confidence: 0.5,
        reason: 'layout container',
        test: (n) => ['main', 'section', 'header', 'footer', 'aside'].includes(n.tagName) || this.hasClass(n, 'container'),
        map: (n) => ({ layout: 'block', tag: n.tagName === 'div' ? 'div' : 'div' }),
      },
    ];
  }

  private hasClass(node: ElementNode, name: string): boolean {
    return this.attributes.extractClasses(node.attributes).includes(name);
  }
}
