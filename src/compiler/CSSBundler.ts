export interface CSSBundle {
  css: string;
  sources: string[];
  bytes: number;
}

export class CSSBundler {
  bundle(sheets: { url: string; css: string }[], options: { minify?: boolean } = {}): CSSBundle {
    const parts = sheets.map((sheet) => `/* ${sheet.url} */\n${sheet.css}`);
    let css = parts.join('\n');
    if (options.minify) {
      css = css
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/\s+/g, ' ')
        .replace(/\s*([{}:;,])\s*/g, '$1')
        .replace(/;}/g, '}')
        .trim();
    }
    return { css, sources: sheets.map((sheet) => sheet.url), bytes: Buffer.byteLength(css, 'utf8') };
  }
}
