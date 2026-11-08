import { TemplateCompiler } from './TemplateCompiler.js';
import type { TemplateDefinition } from '../core/types.js';

export interface RenderedPage {
  title: string;
  html: string;
  styles: string[];
  scripts: string[];
}

export class TemplateRenderer {
  constructor(private readonly compiler = new TemplateCompiler()) {}

  render(template: TemplateDefinition, options: { title?: string; styles?: string[] } = {}): RenderedPage {
    const result = this.compiler.compile(template);
    return {
      title: options.title ?? template.name,
      html: result.html,
      styles: [...(options.styles ?? []), ...template.assets.filter((asset) => asset.endsWith('.css'))],
      scripts: result.bindings,
    };
  }

  renderDocument(template: TemplateDefinition, options: { title?: string; styles?: string[] } = {}): string {
    const page = this.render(template, options);
    const styles = page.styles.map((href) => `<link rel="stylesheet" href="${href}">`).join('');
    const scripts = page.scripts.map((code) => `<script>${code}</script>`).join('');
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${page.title}</title>${styles}</head><body>${page.html}${scripts}</body></html>`;
  }
}
