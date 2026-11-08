export interface NormalizeOptions {
  collapseWhitespace?: boolean;
  removeComments?: boolean;
  stripScripts?: boolean;
  stripEventHandlers?: boolean;
}

export class HTMLNormalizer {
  normalize(html: string, options: NormalizeOptions = {}): string {
    let out = html;
    if (options.removeComments ?? true) out = out.replace(/<!--[\s\S]*?-->/g, '');
    if (options.stripScripts) out = out.replace(/<script\b[\s\S]*?<\/script>/gi, '');
    if (options.stripEventHandlers) out = out.replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*')/gi, '');
    if (options.collapseWhitespace ?? true) out = out.replace(/>\s+</g, '><').replace(/[ \t]{2,}/g, ' ');
    return out.trim();
  }

  stripUnsafe(html: string): string {
    return html
      .replace(/<script\b[\s\S]*?<\/script>/gi, '')
      .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*')/gi, '')
      .replace(/javascript:/gi, '');
  }
}
