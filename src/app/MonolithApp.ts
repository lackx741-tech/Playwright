import { AppController } from './AppController.js';
import { ModuleRegistry } from './ModuleRegistry.js';
import { TaskOrchestrator } from './TaskOrchestrator.js';
import { PageLoader } from '../playwright/PageLoader.js';
import { DOMSnapshotFactory } from '../playwright/DOMSnapshot.js';
import { ScreenshotCapture } from '../playwright/ScreenshotCapture.js';
import { ExportManager } from '../exporter/ExportManager.js';
import { BuildRepository } from '../storage/BuildRepository.js';
import { ProjectRepository } from '../storage/ProjectRepository.js';
import { URLValidator } from '../security/URLValidator.js';
import { HTMLSanitizer } from '../security/HTMLSanitizer.js';
import { DependencyAuditor } from '../security/DependencyAuditor.js';
import { readFile } from 'node:fs/promises';
import type { ExportResult } from '../exporter/ExportManager.js';
import type { DOMSnapshot, TemplateDefinition } from '../core/types.js';

export interface RunOptions {
  name?: string;
  url?: string;
  html?: string;
  htmlFile?: string;
  screenshot?: boolean;
  export?: boolean;
  zip?: boolean;
}

export interface RunResult {
  name: string;
  source: string;
  snapshot: DOMSnapshot | null;
  template: TemplateDefinition;
  html: string;
  export: ExportResult | null;
  stats: { elements: number; detected: number; components: number; bundleBytes: number };
}

export class MonolithApp {
  readonly modules = new ModuleRegistry();
  readonly tasks = new TaskOrchestrator();
  readonly controller = new AppController();
  readonly loader = new PageLoader();
  readonly snapshots = new DOMSnapshotFactory();
  readonly screenshots = new ScreenshotCapture();
  readonly exporter = new ExportManager();
  readonly builds = new BuildRepository();
  readonly projects = new ProjectRepository();
  readonly urls = new URLValidator();
  readonly sanitizer = new HTMLSanitizer();
  readonly auditor = new DependencyAuditor();

  constructor() {
    this.registerModules();
  }

  private registerModules(): void {
    this.modules.register('controller', () => this.controller);
    this.modules.register('loader', () => this.loader);
    this.modules.register('exporter', () => this.exporter);
    this.modules.register('registry', () => this.controller.registry);
  }

  async run(options: RunOptions): Promise<RunResult> {
    const name = options.name ?? `pageforgex-${Date.now()}`;
    const { html, source, snapshot } = await this.resolveSource(options);

    return this.tasks.run(`build:${name}`, async () => {
      const analysis = this.controller.analyze(html, source);
      const template = this.controller.builder.fromInstances(name, analysis.conversion.instances);
      const rendered = this.controller.renderer.render(template);
      const document = this.controller.renderer.renderDocument(template);
      const built = this.controller.bundles.build({ html: document, bindings: rendered.scripts, name, resources: analysis.document.assets });

      let exported: ExportResult | null = null;
      if (options.export ?? true) {
        exported = await this.exporter.export({
          name,
          html: document,
          compile: built.compile,
          files: built.files,
          zip: options.zip ?? true,
        });
      }

      await this.builds.save(built.manifest);
      await this.projects.create(name, source, { url: options.url ?? null });

      return {
        name,
        source,
        snapshot,
        template,
        html: document,
        export: exported,
        stats: {
          elements: analysis.stats.elementCount,
          detected: analysis.conversion.detected.length,
          components: analysis.conversion.instances.length,
          bundleBytes: built.manifest.totalBytes,
        },
      };
    });
  }

  private async resolveSource(options: RunOptions): Promise<{ html: string; source: string; snapshot: DOMSnapshot | null }> {
    if (options.htmlFile) {
      const html = await readFile(options.htmlFile, 'utf8');
      return { html: this.sanitizer.sanitize(html), source: options.htmlFile, snapshot: null };
    }
    if (options.html) {
      return { html: this.sanitizer.sanitize(options.html), source: 'inline', snapshot: null };
    }
    if (options.url) {
      const url = this.urls.assertAllowed(options.url);
      const loaded = await this.tasks.run(`load:${url}`, () => this.loader.load(url));
      let screenshotPath: string | null = null;
      if (options.screenshot) {
        screenshotPath = await this.tasks.run(`screenshot:${url}`, () => this.screenshots.capture(url));
      }
      const snapshot = this.snapshots.create(loaded.url, loaded.html, loaded.title, screenshotPath);
      this.auditor.audit(snapshot.resources);
      return { html: loaded.html, source: loaded.url, snapshot };
    }
    throw new Error('MonolithApp.run requires one of: url, html, htmlFile');
  }

  async shutdown(): Promise<void> {
    await this.loader.shutdown();
    await this.screenshots.shutdown();
  }

  status() {
    return {
      modules: this.modules.status(),
      tasks: this.tasks.summary(),
      components: this.controller.registry.list().map((definition) => definition.schema.type),
    };
  }
}
