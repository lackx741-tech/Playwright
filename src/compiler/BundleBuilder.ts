import { JavaScriptCompiler, type CompileInput } from './JavaScriptCompiler.js';
import { CSSBundler } from './CSSBundler.js';
import { DependencyBundler } from './DependencyBundler.js';
import type { BundleFile, BundleManifest, CollectedResource, CompileResult } from '../core/types.js';

export interface BuildBundleInput extends CompileInput {
  resources?: CollectedResource[];
  stylesheets?: { url: string; css: string }[];
}

export class BundleBuilder {
  constructor(
    private readonly compiler = new JavaScriptCompiler(),
    private readonly css = new CSSBundler(),
    private readonly deps = new DependencyBundler(),
  ) {}

  build(input: BuildBundleInput): { files: BundleFile[]; manifest: BundleManifest; compile: CompileResult } {
    const cssBundle = this.css.bundle(input.stylesheets ?? [], { minify: false });
    const compile = this.compiler.compile({ ...input, css: cssBundle.css || undefined });
    const dependency = this.deps.bundle(input.resources ?? []);

    const files: BundleFile[] = [
      { path: compile.entryPoint, contents: compile.code, kind: 'javascript' },
    ];
    if (compile.sourceMap) files.push({ path: `${compile.entryPoint}.map`, contents: compile.sourceMap, kind: 'json' });
    if (cssBundle.css) files.push({ path: `${input.name ?? 'pageforgex'}.css`, contents: cssBundle.css, kind: 'css' });
    files.push({ path: `${input.name ?? 'pageforgex'}.html`, contents: input.html, kind: 'html' });
    if (dependency.externals.length > 0) {
      files.push({ path: 'dependencies.json', contents: JSON.stringify(dependency, null, 2), kind: 'json' });
    }

    const manifest: BundleManifest = {
      name: input.name ?? 'pageforgex',
      format: this.compiler['config'] ? (this.compiler as unknown as { config: { format: 'esm' | 'iife' } }).config.format : 'esm',
      generatedAt: new Date().toISOString(),
      files: files.map((file) => ({ path: file.path, kind: file.kind, bytes: Buffer.byteLength(file.contents, 'utf8') })),
      totalBytes: files.reduce((total, file) => total + Buffer.byteLength(file.contents, 'utf8'), 0),
    };

    return { files, manifest, compile };
  }
}
