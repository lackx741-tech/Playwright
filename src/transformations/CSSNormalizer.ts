export interface NormalizedStyles {
  rules: { selector: string; declarations: Record<string, string> }[];
  mediaQueries: { query: string; body: string }[];
}

export class CSSNormalizer {
  normalize(css: string): NormalizedStyles {
    const mediaQueries: { query: string; body: string }[] = [];
    const withoutMedia = css.replace(/@media([^{]+)\{([\s\S]*?)\}\s*\}/g, (_match, query: string, body: string) => {
      mediaQueries.push({ query: query.trim(), body: body.trim() });
      return '';
    });

    const rules: { selector: string; declarations: Record<string, string> }[] = [];
    for (const match of withoutMedia.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const selector = (match[1] ?? '').trim();
      const declarations: Record<string, string> = {};
      for (const part of (match[2] ?? '').split(';')) {
        const [property, ...rest] = part.split(':');
        if (!property || rest.length === 0) continue;
        declarations[property.trim()] = rest.join(':').trim();
      }
      if (selector) rules.push({ selector, declarations });
    }
    return { rules, mediaQueries };
  }

  minify(css: string): string {
    return css
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\s+/g, ' ')
      .replace(/\s*([{}:;,])\s*/g, '$1')
      .replace(/;}/g, '}')
      .trim();
  }
}
