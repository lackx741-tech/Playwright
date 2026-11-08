import type { TemplateNode } from '../core/types.js';

export interface LayoutBox {
  node: TemplateNode;
  depth: number;
  index: number;
  parentType: string | null;
}

export class LayoutEngine {
  flatten(root: TemplateNode): LayoutBox[] {
    const boxes: LayoutBox[] = [];
    const walk = (node: TemplateNode, depth: number, parentType: string | null) => {
      node.children.forEach((child, index) => {
        boxes.push({ node: child, depth, index, parentType: node.componentType });
        walk(child, depth + 1, node.componentType);
      });
    };
    boxes.push({ node: root, depth: 0, index: 0, parentType: null });
    walk(root, 1, null);
    return boxes;
  }

  depth(root: TemplateNode): number {
    if (root.children.length === 0) return 1;
    return 1 + Math.max(...root.children.map((child) => this.depth(child)));
  }

  count(root: TemplateNode): number {
    return 1 + root.children.reduce((total, child) => total + this.count(child), 0);
  }

  appendChild(root: TemplateNode, parentSelector: string, child: TemplateNode): boolean {
    const target = this.find(root, (node) => node.componentType === parentSelector);
    if (!target) return false;
    target.children.push(child);
    return true;
  }

  find(root: TemplateNode, predicate: (node: TemplateNode) => boolean): TemplateNode | null {
    if (predicate(root)) return root;
    for (const child of root.children) {
      const found = this.find(child, predicate);
      if (found) return found;
    }
    return null;
  }
}
