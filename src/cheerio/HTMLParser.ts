import * as cheerio from 'cheerio';
import { cheerioConfig, type CheerioConfig } from '../../config/cheerio.js';
import { ElementExtractor } from './ElementExtractor.js';
import { ResourceCollector } from '../playwright/ResourceCollector.js';
import type { ParsedDocument } from '../core/types.js';

export class HTMLParser {
  private readonly extractor = new ElementExtractor();
  private readonly collector = new ResourceCollector();

  constructor(private readonly config: CheerioConfig = cheerioConfig) {}

  parse(html: string, source = 'inline'): ParsedDocument {
    const $ = cheerio.load(html, {
      xmlMode: this.config.xmlMode,
      quirksMode: this.config.quirksMode,
      ...(this.config.baseURI ? { baseURI: this.config.baseURI } : {}),
    });

    const root = this.extractor.buildTree($);
    const links = $('a[href]')
      .map((_, el) => $(el).attr('href') ?? '')
      .get()
      .filter((href) => href.length > 0);

    return {
      source,
      title: $('title').first().text().trim(),
      root,
      elementCount: Math.min($('*').length, this.config.maxElements),
      assets: this.collector.collect(html, source),
      links,
    };
  }
}
