import { describe, expect, it } from 'vitest';
import { JavaScriptCompiler } from '../src/compiler/JavaScriptCompiler.js';
import { BundleBuilder } from '../src/compiler/BundleBuilder.js';
import { CSSBundler } from '../src/compiler/CSSBundler.js';
import { DependencyBundler } from '../src/compiler/DependencyBundler.js';
import { RuntimeGenerator } from '../src/compiler/RuntimeGenerator.js';
import { SourceMapGenerator } from '../src/compiler/SourceMapGenerator.js';

describe('JavaScriptCompiler', () => {
  it('emits a runnable bundle with runtime and entry point', () => {
    const result = new JavaScriptCompiler().compile({ html: '<div id="app"></div>', bindings: ["console.log('bound');"], name: 'demo' });
    expect(result.entryPoint).toBe('demo.js');
    expect(result.code).toContain('PageForgeX');
    expect(result.code).toContain('injectStyles');
    expect(result.bytes).toBeGreaterThan(0);
    expect(result.warnings).toHaveLength(0);
  });

  it('warns when no markup is provided', () => {
    const result = new JavaScriptCompiler().compile({ html: '', bindings: [] });
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('produces a source map', () => {
    const result = new JavaScriptCompiler().compile({ html: '<div></div>', bindings: [], name: 'mapped' });
    expect(result.sourceMap).not.toBeNull();
    const map = JSON.parse(result.sourceMap ?? '{}');
    expect(map.version).toBe(3);
    expect(map.sources).toContain('runtime.js');
  });

  it('generates syntactically valid javascript', () => {
    const result = new JavaScriptCompiler().compile({ html: '<div></div>', bindings: [], name: 'valid' });
    expect(() => new Function(result.code)).not.toThrow();
  });
});

describe('RuntimeGenerator', () => {
  it('generates a runtime with the expected api', () => {
    const code = new RuntimeGenerator().generate({ namespace: 'Demo' });
    for (const api of ['register', 'mount', 'on', 'emit', 'injectStyles']) {
      expect(code).toContain(api);
    }
  });
});

describe('CSSBundler', () => {
  it('concatenates and minifies stylesheets', () => {
    const bundle = new CSSBundler().bundle([{ url: 'a.css', css: '.a { color: red; }' }], { minify: true });
    expect(bundle.css).toBe('.a{color:red}');
    expect(bundle.sources).toEqual(['a.css']);
  });
});

describe('DependencyBundler', () => {
  it('separates external and local scripts', () => {
    const bundle = new DependencyBundler().bundle([
      { url: 'https://cdn.example.com/lib.js', kind: 'script', attributes: {} },
      { url: '/local/app.js', kind: 'script', attributes: {} },
      { url: '/style.css', kind: 'stylesheet', attributes: {} },
    ]);
    expect(bundle.externals).toEqual(['https://cdn.example.com/lib.js']);
    expect(bundle.locals).toEqual(['/local/app.js']);
  });
});

describe('SourceMapGenerator', () => {
  it('serializes an inline source map', () => {
    const generator = new SourceMapGenerator();
    const map = generator.generate('bundle.js', [{ name: 'x.js', content: 'x' }]);
    expect(JSON.parse(generator.serialize(map)).file).toBe('bundle.js');
  });
});

describe('BundleBuilder', () => {
  it('assembles js, css, html and manifest files', () => {
    const builder = new BundleBuilder();
    const { files, manifest } = builder.build({
      name: 'bundle',
      html: '<div id="app"></div>',
      bindings: [],
      stylesheets: [{ url: 'app.css', css: 'body{margin:0}' }],
      resources: [{ url: 'https://cdn.example.com/x.js', kind: 'script', attributes: {} }],
    });
    const paths = files.map((file) => file.path);
    expect(paths).toContain('bundle.js');
    expect(paths).toContain('bundle.css');
    expect(paths).toContain('bundle.html');
    expect(paths).toContain('dependencies.json');
    expect(manifest.totalBytes).toBeGreaterThan(0);
    expect(manifest.files).toHaveLength(files.length);
  });
});
