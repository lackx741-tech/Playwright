import type { ElementNode, ParsedDocument } from '../core/types.js';
import { SelectorEngine } from './SelectorEngine.js';

export interface DOMStatistics {
  elementCount: number;
  maxDepth: number;
  tagHistogram: Record<string, number>;
  landmarkCounts: Record<string, number>;
  headingOutline: { level: number; text: string }[];
  interactiveCount: number;
}

const LANDMARKS: Record<string, string> = {
  header: 'header',
  nav: 'nav',
  main: 'main',
  footer: 'footer',
  aside: 'aside',
  section: 'section',
  article: 'article',
};

export class DOMAnalyzer {
  analyze(document: ParsedDocument): DOMStatistics {
    const tagHistogram: Record<string, number> = {};
    let maxDepth = 0;
    let elementCount = 0;
    let interactiveCount = 0;
    const headingOutline: { level: number; text: string }[] = [];

    const visit = (node: ElementNode, depth: number) => {
      elementCount += 1;
      maxDepth = Math.max(maxDepth, depth);
      tagHistogram[node.tagName] = (tagHistogram[node.tagName] ?? 0) + 1;
      if (['a', 'button', 'input', 'select', 'textarea'].includes(node.tagName)) interactiveCount += 1;
      const heading = /^h([1-6])$/.exec(node.tagName);
      if (heading && node.text) headingOutline.push({ level: Number(heading[1]), text: node.text });
      for (const child of node.children) visit(child, depth + 1);
    };
    visit(document.root, 1);

    const landmarks = new SelectorEngine(document.root);
    const landmarkCounts: Record<string, number> = {};
    for (const tag of Object.keys(LANDMARKS)) landmarkCounts[tag] = landmarks.count(tag);

    return { elementCount, maxDepth, tagHistogram, landmarkCounts, headingOutline, interactiveCount };
  }
}
