import { compilerConfig, type CompilerConfig } from '../../config/compiler.js';
import { RuntimeGenerator } from './RuntimeGenerator.js';
import { EntryPointGenerator } from './EntryPointGenerator.js';
import { SourceMapGenerator } from './SourceMapGenerator.js';
import type { CompileResult } from '../core/types.js';

export interface CompileInput {
  html: string;
  bindings: string[];
  css?: string;
  name?: string;
  mountSelector?: string;
}

export class JavaScriptCompiler {
  private readonly runtime = new RuntimeGenerator();
  private readonly entry = new EntryPointGenerator();
  private readonly maps = new SourceMapGenerator();

  constructor(private readonly config: CompilerConfig = compilerConfig) {}

  compile(input: CompileInput): CompileResult {
    const name = input.name ?? this.config.bundleName;
    const namespace = this.config.format === 'iife' ? 'PageForgeX' : 'PageForgeX';
    const runtime = this.runtime.generate({ namespace, includeCss: input.css });
    const entry = this.entry.generate({ namespace, html: input.html, bindings: input.bindings, mountSelector: input.mountSelector });
    const warnings: string[] = [];
    if (!input.html) warnings.push('Compiled bundle contains no template markup.');

    let code = [runtime, entry].join('\n');
    let sourceMap: string | null = null;
    if (this.config.sourceMap) {
      const map = this.maps.generate(`${name}.js`, [
        { name: 'runtime.js', content: runtime },
        { name: 'entry.js', content: entry },
      ]);
      sourceMap = this.maps.serialize(map);
      code = this.maps.appendComment(code, `${name}.js.map`);
    }
    if (this.config.minify) code = this.minify(code);

    return { code, sourceMap, entryPoint: `${name}.js`, bytes: Buffer.byteLength(code, 'utf8'), warnings };
  }

  minify(code: string): string {
    return code
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0 && !line.startsWith('//'))
      .join('\n');
  }
}
