import type { ElementNode } from '../core/types.js';

export interface SelectorMatch {
  selector: string;
  count: number;
  paths: string[];
}

export class SelectorEngine {
  constructor(private readonly root: ElementNode) {}

  query(selector: string): ElementNode[] {
    const parsed = this.parse(selector);
    return this.walk(this.root, parsed);
  }

  count(selector: string): number {
    return this.query(selector).length;
  }

  match(selectors: string[]): SelectorMatch[] {
    return selectors.map((selector) => {
      const nodes = this.query(selector);
      return { selector, count: nodes.length, paths: nodes.map((n) => n.path) };
    });
  }

  private parse(selector: string): { tag?: string; classes: string[]; id?: string; attribute?: [string, string?] } {
    const result: { tag?: string; classes: string[]; id?: string; attribute?: [string, string?] } = { classes: [] };
    const parts = selector.trim().split(/(?=[.#[])/);
    for (const part of parts) {
      if (part.startsWith('.')) result.classes.push(part.slice(1));
      else if (part.startsWith('#')) result.id = part.slice(1);
      else if (part.startsWith('[')) {
        const body = part.replace(/^\[|\]$/g, '');
        const [rawName, value] = body.split('=');
        if (rawName) result.attribute = [rawName.replace(/^\^/, ''), value?.replace(/^"|"$/g, '')];
      } else if (part) result.tag = part.toLowerCase();
    }
    return result;
  }

  private walk(node: ElementNode, sel: { tag?: string; classes: string[]; id?: string; attribute?: [string, string?] }): ElementNode[] {
    const out: ElementNode[] = [];
    const matches = (n: ElementNode) => {
      if (sel.tag && n.tagName !== sel.tag) return false;
      if (sel.id && n.attributes['id'] !== sel.id) return false;
      if (sel.classes.length > 0) {
        const classes = (n.attributes['class'] ?? '').split(/\s+/);
        if (!sel.classes.every((c) => classes.includes(c))) return false;
      }
      if (sel.attribute) {
        const [name, value] = sel.attribute;
        if (!(name in n.attributes)) return false;
        if (value !== undefined && n.attributes[name] !== value) return false;
      }
      return true;
    };
    if (matches(node)) out.push(node);
    for (const child of node.children) out.push(...this.walk(child, sel));
    return out;
  }
}
