import { describe, expect, it, afterAll } from 'vitest';
import { rm } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { AppController } from '../src/app/AppController.js';
import { ModuleRegistry } from '../src/app/ModuleRegistry.js';
import { TaskOrchestrator } from '../src/app/TaskOrchestrator.js';

const html = readFileSync(new URL('./fixtures/sample.html', import.meta.url), 'utf8');

describe('AppController', () => {
  it('analyzes html into components and a template', () => {
    const controller = new AppController();
    const analysis = controller.analyze(html, 'test');
    expect(analysis.stats.elementCount).toBeGreaterThan(0);
    expect(analysis.conversion.instances.length).toBeGreaterThan(0);

    const template = controller.buildTemplate('demo', html, 'test');
    expect(template.name).toBe('demo');
    const compiled = controller.compileTemplate(template);
    expect(compiled.report.valid).toBe(true);
    expect(compiled.render.html.length).toBeGreaterThan(0);
  });

  it('compiles a bundle from a template', () => {
    const controller = new AppController();
    const template = controller.buildTemplate('demo', html, 'test');
    const built = controller.compileBundle(template);
    expect(built.manifest.totalBytes).toBeGreaterThan(0);
    expect(built.files.some((file) => file.kind === 'javascript')).toBe(true);
  });
});

describe('ModuleRegistry', () => {
  it('lazily resolves modules and reports status', () => {
    const registry = new ModuleRegistry();
    let created = 0;
    registry.register('thing', () => ({ value: ++created }));
    expect(registry.status()[0]?.initialized).toBe(false);
    expect(registry.resolve<{ value: number }>('thing').value).toBe(1);
    expect(registry.resolve<{ value: number }>('thing').value).toBe(1);
    expect(registry.status()[0]?.initialized).toBe(true);
    expect(() => registry.resolve('missing')).toThrow();
  });
});

describe('TaskOrchestrator', () => {
  it('tracks successful and failed tasks', async () => {
    const orchestrator = new TaskOrchestrator();
    await orchestrator.run('ok', async () => 42);
    await expect(
      orchestrator.run('bad', async () => {
        throw new Error('boom');
      }),
    ).rejects.toThrow('boom');
    const summary = orchestrator.summary();
    expect(summary.done).toBe(1);
    expect(summary.failed).toBe(1);
  });
});
