#!/usr/bin/env node
import { MonolithApp } from '../app/MonolithApp.js';
import { DashboardController } from '../dashboard/DashboardController.js';
import { ComponentRegistry } from '../components/ComponentRegistry.js';
import { TemplateBuilder } from '../templates/TemplateBuilder.js';
import { TemplateRenderer } from '../templates/TemplateRenderer.js';
import { URLValidator } from '../security/URLValidator.js';
import { flagBool, flagString, parseArgs } from './args.js';
import { writeFile } from 'node:fs/promises';

const HELP = `PageForgeX - browser intelligence, component registry and JavaScript bundle engine

Usage:
  pageforgex scan <url> [--name bundle] [--screenshot] [--no-export]
  pageforgex parse <file.html> [--json]
  pageforgex components
  pageforgex template <file.html> --name <name> [--out template.json]
  pageforgex build <file.html> --name <name> [--no-zip]
  pageforgex dashboard [--port 12000]
  pageforgex help
`;

async function main(): Promise<number> {
  const { command, flags, positionals } = parseArgs(process.argv.slice(2));

  switch (command) {
    case 'scan': {
      const url = positionals[0];
      if (!url) {
        console.error('scan requires a URL argument.');
        return 1;
      }
      const app = new MonolithApp();
      try {
        const result = await app.run({
          url,
          name: flagString(flags, 'name'),
          screenshot: flagBool(flags, 'screenshot'),
          export: !flagBool(flags, 'no-export', false),
          zip: !flagBool(flags, 'no-zip', false),
        });
        console.log(JSON.stringify({ name: result.name, stats: result.stats, export: result.export?.manifest ?? null }, null, 2));
      } finally {
        await app.shutdown();
      }
      return 0;
    }
    case 'parse': {
      const file = positionals[0];
      if (!file) {
        console.error('parse requires an HTML file argument.');
        return 1;
      }
      const app = new MonolithApp();
      const { readFile } = await import('node:fs/promises');
      const html = await readFile(file, 'utf8');
      const analysis = app.controller.analyze(html, file);
      const payload = flagBool(flags, 'json')
        ? { stats: analysis.stats, detected: analysis.conversion.detected }
        : { ...analysis.stats, detected: analysis.conversion.detected.length };
      console.log(JSON.stringify(payload, null, 2));
      return 0;
    }
    case 'components': {
      const registry = new ComponentRegistry();
      console.log(JSON.stringify(registry.schemas(), null, 2));
      return 0;
    }
    case 'template': {
      const file = positionals[0];
      const name = flagString(flags, 'name');
      if (!file || !name) {
        console.error('template requires <file.html> and --name <name>.');
        return 1;
      }
      const { readFile } = await import('node:fs/promises');
      const html = await readFile(file, 'utf8');
      const app = new MonolithApp();
      const template = app.controller.buildTemplate(name, html, file);
      const serialized = JSON.stringify(template, null, 2);
      const out = flagString(flags, 'out');
      if (out) {
        await writeFile(out, serialized, 'utf8');
        console.log(`Template written to ${out}`);
      } else {
        console.log(serialized);
      }
      return 0;
    }
    case 'build': {
      const file = positionals[0];
      const name = flagString(flags, 'name') ?? `pageforgex-${Date.now()}`;
      if (!file) {
        console.error('build requires an HTML file argument.');
        return 1;
      }
      const { readFile } = await import('node:fs/promises');
      const html = await readFile(file, 'utf8');
      const registry = new ComponentRegistry();
      const builder = new TemplateBuilder(registry);
      const renderer = new TemplateRenderer();
      const app = new MonolithApp();
      const analysis = app.controller.analyze(html, file);
      const template = builder.fromInstances(name, analysis.conversion.instances);
      const document = renderer.renderDocument(template);
      const rendered = renderer.render(template);
      const built = app.controller.bundles.build({ html: document, bindings: rendered.scripts, name, resources: analysis.document.assets });
      const exported = await app.exporter.export({
        name,
        html: document,
        compile: built.compile,
        files: built.files,
        zip: !flagBool(flags, 'no-zip', false),
      });
      console.log(JSON.stringify({ manifest: exported.manifest, written: exported.written, issues: exported.report.issues }, null, 2));
      return 0;
    }
    case 'dashboard': {
      const port = Number(flagString(flags, 'port') ?? process.env.PAGEFORGEX_DASHBOARD_PORT ?? 12000);
      const dashboard = new DashboardController();
      const address = await dashboard.start({ port });
      console.log(`PageForgeX dashboard listening on ${address}`);
      return 0;
    }
    case 'validate-url': {
      const url = positionals[0];
      if (!url) {
        console.error('validate-url requires a URL argument.');
        return 1;
      }
      const validator = new URLValidator();
      const result = validator.validate(url);
      console.log(JSON.stringify(result, null, 2));
      return result.allowed ? 0 : 1;
    }
    case 'help':
    default:
      console.log(HELP);
      return command === 'help' ? 0 : 1;
  }
}

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
