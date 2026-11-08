import { HTMLNormalizer } from '../cheerio/HTMLNormalizer.js';
import type { ValidationIssue } from '../core/types.js';

const DANGEROUS_TAGS = /<(script|iframe|object|embed|link\s+rel=["']?import)\b/i;

export class HTMLSanitizer {
  private readonly normalizer = new HTMLNormalizer();

  sanitize(html: string, options: { allowScripts?: boolean; allowInlineHandlers?: boolean } = {}): string {
    if (options.allowScripts && options.allowInlineHandlers) return html;
    let out = html;
    if (!options.allowScripts) out = out.replace(/<script\b[\s\S]*?<\/script>/gi, '');
    if (!options.allowInlineHandlers) out = out.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
    out = out.replace(/javascript:\s*/gi, '');
    return out;
  }

  inspect(html: string): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    if (DANGEROUS_TAGS.test(html)) {
      issues.push({ severity: 'warning', code: 'dangerous-tag', message: 'HTML contains scriptable tags that were stripped or should be reviewed.' });
    }
    if (/\son[a-z]+\s*=/i.test(html)) {
      issues.push({ severity: 'warning', code: 'inline-handler', message: 'HTML contains inline event handlers.' });
    }
    if (/javascript:/i.test(html)) {
      issues.push({ severity: 'warning', code: 'javascript-uri', message: 'HTML contains javascript: URIs.' });
    }
    return issues;
  }

  normalize(html: string): string {
    return this.normalizer.stripUnsafe(html);
  }
}
