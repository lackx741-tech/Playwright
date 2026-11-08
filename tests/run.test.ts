import { describe, expect, it, afterAll } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { MonolithApp } from '../src/app/MonolithApp.js';
import { BuildRepository } from '../src/storage/BuildRepository.js';
import { ComponentRepository } from '../src/storage/ComponentRepository.js';

const html = readFileSync(new URL('./fixtures/sample.html', import.meta.url), 'utf8');
const temporaryDirs: string[] = [];

async function tempDir(): Promise<string> {
  const dir = await mkdtemp(path.join(tmpdir(), 'pageforgex-app-'));
  temporaryDirs.push(dir);
  return dir;
}

afterAll(async () => {
  for (const dir of temporaryDirs) await rm(dir, { recursive: true, force: true });
});

describe('MonolithApp', () => {
  it('runs the inline pipeline and exports a bundle', async () => {
    const dir = await tempDir();
    const app = new MonolithApp();
    const exportManager = app.exporter as unknown as { config: { bundleDir: string; templateDir: string; archiveDir: string } };
    exportManager.config.bundleDir = path.join(dir, 'bundles');
    exportManager.config.templateDir = path.join(dir, 'templates');
    exportManager.config.archiveDir = path.join(dir, 'archives');
    const buildRepo = app.builds as unknown as { store: { directory: string } };
    buildRepo.store.directory = path.join(dir, 'builds');
    const projectRepo = app.projects as unknown as { store: { directory: string } };
    projectRepo.store.directory = path.join(dir, 'projects');

    const result = await app.run({ html, name: 'monolith', export: true, zip: true });
    expect(result.name).toBe('monolith');
    expect(result.stats.components).toBeGreaterThan(0);
    expect(result.export?.written.length).toBeGreaterThan(0);
    expect(result.html).toContain('<!DOCTYPE html>');
    expect(app.status().components).toContain('button');
  });

  it('requires a source', async () => {
    const app = new MonolithApp();
    await expect(app.run({})).rejects.toThrow(/requires one of/);
  });
});

describe('repositories', () => {
  it('persists builds and components', async () => {
    const dir = await tempDir();
    const builds = new BuildRepository(path.join(dir, 'builds'));
    await builds.save({ name: 'demo', format: 'esm', generatedAt: new Date().toISOString(), files: [], totalBytes: 0 });
    const latest = await builds.latest('demo');
    expect(latest?.name).toBe('demo');

    const components = new ComponentRepository(path.join(dir, 'components'));
    await components.save({ type: 'button', category: 'action', properties: [], events: [] });
    expect((await components.get('button'))?.schema.type).toBe('button');
    expect(await components.remove('button')).toBe(true);
    expect(await components.get('button')).toBeNull();
  });
});
