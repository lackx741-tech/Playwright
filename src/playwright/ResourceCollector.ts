import type { CollectedResource, ResourceKind } from '../core/types.js';

const EXTENSION_KINDS: [RegExp, ResourceKind][] = [
  [/\.css(\?|$)/i, 'stylesheet'],
  [/\.m?js(\?|$)/i, 'script'],
  [/\.(png|jpe?g|gif|webp|svg|avif|ico)(\?|$)/i, 'image'],
  [/\.(woff2?|ttf|otf|eot)(\?|$)/i, 'font'],
  [/\.(mp4|webm|ogg|mp3|wav)(\?|$)/i, 'media'],
];

export class ResourceCollector {
  collect(html: string, baseUrl = ''): CollectedResource[] {
    const found = new Map<string, CollectedResource>();
    const push = (raw: string, kind: ResourceKind, attributes: Record<string, string>) => {
      const url = this.normalize(raw, baseUrl);
      if (!url) return;
      const existing = found.get(url);
      if (existing) {
        Object.assign(existing.attributes, attributes);
        return;
      }
      found.set(url, { url, kind, attributes });
    };

    for (const match of html.matchAll(/<link\b[^>]*>/gi)) {
      const tag = match[0];
      const href = this.attr(tag, 'href');
      if (!href) continue;
      const rel = (this.attr(tag, 'rel') ?? '').toLowerCase();
      push(href, rel.includes('stylesheet') ? 'stylesheet' : 'other', { rel, ...this.attrs(tag) });
    }

    for (const match of html.matchAll(/<script\b[^>]*>/gi)) {
      const tag = match[0];
      const src = this.attr(tag, 'src');
      if (src) push(src, 'script', this.attrs(tag));
    }

    for (const match of html.matchAll(/<img\b[^>]*>/gi)) {
      const tag = match[0];
      const src = this.attr(tag, 'src') ?? this.attr(tag, 'data-src');
      if (src) push(src, 'image', this.attrs(tag));
    }

    for (const match of html.matchAll(/<source\b[^>]*>/gi)) {
      const tag = match[0];
      const src = this.attr(tag, 'src');
      const type = this.attr(tag, 'type') ?? '';
      if (src) push(src, type.includes('font') ? 'font' : 'media', this.attrs(tag));
    }

    for (const match of html.matchAll(/url\((['"]?)([^'")]+)\1\)/gi)) {
      const url = match[2];
      if (url && !url.startsWith('data:')) push(url, this.kindFromExtension(url), { source: 'css' });
    }

    return [...found.values()];
  }

  kindFromExtension(url: string): ResourceKind {
    for (const [pattern, kind] of EXTENSION_KINDS) {
      if (pattern.test(url)) return kind;
    }
    return 'other';
  }

  private normalize(raw: string, baseUrl: string): string | null {
    const value = raw.trim();
    if (!value || value.startsWith('data:') || value.startsWith('javascript:')) return null;
    if (value.startsWith('#')) return null;
    if (/^[a-z]+:\/\//i.test(value)) return value;
    if (!baseUrl) return value;
    try {
      return new URL(value, baseUrl).toString();
    } catch {
      return value;
    }
  }

  private attr(tag: string, name: string): string | null {
    const match = tag.match(new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'));
    if (!match) return null;
    return (match[2] ?? match[3] ?? match[4] ?? '').trim() || null;
  }

  private attrs(tag: string): Record<string, string> {
    const out: Record<string, string> = {};
    for (const match of tag.matchAll(/([a-zA-Z-]+)\s*=\s*("([^"]*)"|'([^']*)')/g)) {
      const key = match[1];
      if (key) out[key] = (match[3] ?? match[4] ?? '').trim();
    }
    return out;
  }
}
