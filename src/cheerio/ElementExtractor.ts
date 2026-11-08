import type { CheerioAPI } from 'cheerio';
import type { AnyNode } from 'domhandler';
import type { ElementNode } from '../core/types.js';

export class ElementExtractor {
  buildTree($: CheerioAPI): ElementNode {
    const rootNode = $('html').get(0) ?? $.root().get(0);
    if (!rootNode) {
      return { tagName: 'html', attributes: {}, text: '', children: [], path: 'html' };
    }
    return this.toNode($, rootNode, 'html');
  }

  toNode($: CheerioAPI, node: AnyNode, path: string): ElementNode {
    const $node = $(node);
    const tagName = (('tagName' in node && typeof node.tagName === 'string') ? node.tagName : 'root').toLowerCase();
    const attributes: Record<string, string> = {};
    const raw = ('attribs' in node && node.attribs) ? node.attribs : {};
    for (const [key, value] of Object.entries(raw)) attributes[key] = String(value);

    const children: ElementNode[] = [];
    let index = 0;
    $node.children().each((_, child) => {
      const childTag = ('tagName' in child && typeof child.tagName === 'string') ? child.tagName.toLowerCase() : 'text';
      children.push(this.toNode($, child, `${path}>${childTag}[${index++}]`));
    });

    const ownText = $node
      .contents()
      .filter((_, el) => el.type === 'text')
      .map((_, el) => ($(el).text() ?? '').trim())
      .get()
      .filter(Boolean)
      .join(' ');

    return { tagName, attributes, text: ownText, children, path };
  }
}
