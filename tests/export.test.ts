import { describe, expect, it, afterAll } from 'vitest';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { ExportManager } from '../src/exporter/ExportManager.js';
import { ZIPExporter } from '../src/exporter/ZIPExporter.js';
import { ManifestGenerator } from '../src/exporter/ManifestGenerator.js';
import { ExportValidator } from '../src/security/ExportValidator.js';
import { ScriptPolicy } from '../src/security/ScriptPolicy.js';
import { URLValidator } from '../src/security/URLValidator.js';
import { JavaScriptCompiler } from '../src/compiler/JavaScriptCompiler.js';
import { BundleBuilder } from '../src/compiler/BundleBuilder.js';
import type { BundleFile } from '../src/core/types.js';

const temporaryDirs: string[] = [];

async function tempDir(): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), 'pageforgex-'));
  temporaryDirs.push(dir);
  return dir;
}

afterAll(async () => {
  for (const dir of temporaryDirs) await rm(dir, { recursive: true, force: true });
});

describe('ZIPExporter', () => {
  it('builds a zip archive with the local file header signature', () => {
    const files: BundleFile[] = [{ path: 'a.txt', contents: 'hello', kind: 'asset' }];
    const buffer = new ZIPExporter().build(files);
    expect(buffer.readUInt32LE(0)).toBe(0x04034b50);
    expect(buffer.includes(Buffer.from('a.txt'))).toBe(true);
    expect(buffer.readUInt32LE(buffer.length - 22)).toBe(0x06054b50);
  });

  it('writes the archive to disk', async () => {
    const dir = await tempDir();
    const target = await new ZIPExporter().export([{ path: 'a.txt', contents: 'hi', kind: 'asset' }], dir, 'out.zip');
    const contents = await readFile(target);
    expect(contents.readUInt32LE(0)).toBe(0x04034b50);
  });
});

describe('ManifestGenerator', () => {
  it('summarizes files and total size', () => {
    const manifest = new ManifestGenerator().generate('demo', [{ path: 'a.js', contents: 'abc', kind: 'javascript' }]);
    expect(manifest.files[0]?.bytes).toBe(3);
    expect(manifest.totalBytes).toBe(3);
  });
});

describe('ScriptPolicy', () => {
  it('flags eval and Function constructor usage', () => {
    const issues = new ScriptPolicy().evaluate('eval("1"); const f = new Function("return 1");');
    expect(issues.map((issue) => issue.code)).toContain('eval-usage');
    expect(issues.map((issue) => issue.code)).toContain('function-constructor');
  });
});

describe('ExportValidator', () => {
  it('reports empty files and clean bundles', () => {
    const validator = new ExportValidator();
    const report = validator.validate([{ path: 'a.js', contents: '', kind: 'javascript' }]);
    expect(report.issues.some((issue) => issue.code === 'empty-file')).toBe(true);
    expect(report.valid).toBe(true);
  });
});

describe('URLValidator', () => {
  it('blocks private network targets by default', () => {
    const validator = new URLValidator({ blockPrivateNetwork: true });
    expect(validator.validate('http://127.0.0.1/admin').allowed).toBe(false);
    expect(validator.validate('http://localhost:8080/').allowed).toBe(false);
    expect(validator.validate('http://10.0.0.5/').allowed).toBe(false);
    expect(validator.validate('https://example.com/').allowed).toBe(true);
  });

  it('rejects non-http protocols and malformed urls', () => {
    const validator = new URLValidator();
    expect(validator.validate('file:///etc/passwd').allowed).toBe(false);
    expect(validator.validate('not a url').allowed).toBe(false);
    expect(() => validator.assertAllowed('ftp://example.com')).toThrow();
  });
});

describe('ExportManager', () => {
  it('writes bundles, html, manifest and archive', async () => {
    const dir = await tempDir();
    const builder = new BundleBuilder();
    const built = builder.build({ name: 'demo', html: '<div id="app"></div>', bindings: [] });
    const manager = new ExportManager({
      outputDir: dir,
      bundleDir: path.join(dir, 'bundles'),
      templateDir: path.join(dir, 'templates'),
      archiveDir: path.join(dir, 'archives'),
      includeSourceMaps: true,
    });
    const result = await manager.export({ name: 'demo', html: '<div id="app"></div>', compile: built.compile, files: built.files, zip: true });
    expect(result.written.length).toBeGreaterThanOrEqual(3);
    expect(result.archive).not.toBeNull();
    const manifest = JSON.parse(await readFile(path.join(dir, 'templates', 'demo.manifest.json'), 'utf8'));
    expect(manifest.name).toBe('demo');
  });

  it('can skip the archive', async () => {
    const dir = await tempDir();
    const compile = new JavaScriptCompiler().compile({ html: '<div></div>', bindings: [], name: 'nozip' });
    const manager = new ExportManager({
      outputDir: dir,
      bundleDir: path.join(dir, 'bundles'),
      templateDir: path.join(dir, 'templates'),
      archiveDir: path.join(dir, 'archives'),
      includeSourceMaps: false,
    });
    const result = await manager.export({
      name: 'nozip',
      html: '<div></div>',
      compile,
      files: [{ path: compile.entryPoint, contents: compile.code, kind: 'javascript' }],
      zip: false,
    });
    expect(result.archive).toBeNull();
  });
});
