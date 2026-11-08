import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { HTMLParser } from '../src/cheerio/HTMLParser.js';
import { DOMAnalyzer } from '../src/cheerio/DOMAnalyzer.js';
import { SelectorEngine } from '../src/cheerio/SelectorEngine.js';
import { HTMLNormalizer } from '../src/cheerio/HTMLNormalizer.js';
import { ResourceCollector } from '../src/playwright/ResourceCollector.js';

const html = readFileSync(new URL('./fixtures/sample.html', import.meta.url), 'utf8');

describe('HTMLParser', () => {
  const parser = new HTMLParser();

  it('extracts title, elements and links', () => {
    const document = parser.parse(html, 'https://example.com');
    expect(document.title).toBe('Sample Store');
    expect(document.elementCount).toBeGreaterThan(10);
    expect(document.links).toContain('/shop');
  });

  it('builds a nested element tree', () => {
    const document = parser.parse(html);
    expect(document.root.tagName).toBe('html');
    expect(document.root.children.some((child) => child.tagName === 'body')).toBe(true);
  });

  it('collects stylesheet, script and image assets', () => {
    const document = parser.parse(html, 'https://example.com');
    const kinds = document.assets.map((asset) => asset.kind);
    expect(kinds).toContain('stylesheet');
    expect(kinds).toContain('script');
    expect(kinds).toContain('image');
    const stylesheet = document.assets.find((asset) => asset.kind === 'stylesheet');
    expect(stylesheet?.url).toBe('https://example.com/assets/app.css');
  });
});

describe('DOMAnalyzer', () => {
  it('produces statistics about structure', () => {
    const parser = new HTMLParser();
    const stats = new DOMAnalyzer().analyze(parser.parse(html));
    expect(stats.maxDepth).toBeGreaterThan(3);
    expect(stats.landmarkCounts['nav']).toBeGreaterThanOrEqual(1);
    expect(stats.interactiveCount).toBeGreaterThanOrEqual(3);
    expect(stats.tagHistogram['button']).toBe(1);
  });
});

describe('SelectorEngine', () => {
  it('matches tag, class and attribute selectors', () => {
    const parser = new HTMLParser();
    const engine = new SelectorEngine(parser.parse(html).root);
    expect(engine.count('button')).toBe(1);
    expect(engine.count('.card')).toBe(1);
    expect(engine.count('table')).toBe(1);
    expect(engine.match(['nav', 'form']).map((entry) => entry.count)).toEqual([1, 1]);
  });
});

describe('HTMLNormalizer', () => {
  it('strips scripts and inline handlers', () => {
    const normalizer = new HTMLNormalizer();
    const output = normalizer.stripUnsafe('<div onclick="alert(1)"><script>bad()</script>ok</div>');
    expect(output).not.toContain('<script');
    expect(output).not.toContain('onclick');
    expect(output).toContain('ok');
  });
});

describe('ResourceCollector', () => {
  it('deduplicates and resolves relative urls', () => {
    const collector = new ResourceCollector();
    const resources = collector.collect('<link rel="stylesheet" href="a.css"><link rel="stylesheet" href="a.css">', 'https://example.com/base/');
    expect(resources).toHaveLength(1);
    expect(resources[0]?.url).toBe('https://example.com/base/a.css');
  });
});
