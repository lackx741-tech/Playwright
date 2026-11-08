import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { MonolithApp } from '../app/MonolithApp.js';
import { ComponentExplorer } from './ComponentExplorer.js';
import { PropertyInspector } from './PropertyInspector.js';
import { TemplateEditor } from './TemplateEditor.js';
import { BundleSettings } from './BundleSettings.js';
import { ExportPanel } from './ExportPanel.js';
import { renderDashboardHtml } from './dashboardHtml.js';

export interface DashboardOptions {
  port?: number;
  host?: string;
}

export class DashboardController {
  private readonly explorer: ComponentExplorer;
  private readonly inspector: PropertyInspector;
  private readonly templates = new TemplateEditor();
  private readonly settings = new BundleSettings();
  private readonly exports = new ExportPanel();
  private server: ReturnType<typeof createServer> | null = null;

  constructor(private readonly app = new MonolithApp()) {
    this.explorer = new ComponentExplorer(this.app.controller.registry);
    this.inspector = new PropertyInspector(this.app.controller.registry);
  }

  async handle(method: string, pathname: string, body: unknown): Promise<{ status: number; payload: unknown }> {
    if (method === 'GET' && pathname === '/api/status') {
      return { status: 200, payload: this.app.status() };
    }
    if (method === 'GET' && pathname === '/api/components') {
      return { status: 200, payload: this.explorer.catalog() };
    }
    if (method === 'GET' && pathname === '/api/templates') {
      return { status: 200, payload: this.templates.list() };
    }
    if (method === 'GET' && pathname === '/api/settings') {
      return { status: 200, payload: this.settings.get() };
    }
    if (method === 'POST' && pathname === '/api/analyze') {
      const payload = body as { html?: string; url?: string; name?: string };
      if (payload.url) {
        const result = await this.app.run({ url: payload.url, name: payload.name, export: false });
        return { status: 200, payload: { stats: result.stats, template: result.template } };
      }
      const result = await this.app.run({ html: payload.html ?? '', name: payload.name, export: false });
      return { status: 200, payload: { stats: result.stats, template: result.template } };
    }
    if (method === 'POST' && pathname === '/api/build') {
      const payload = body as { html?: string; name?: string; zip?: boolean };
      const name = payload.name ?? `dashboard-${Date.now()}`;
      const analysis = this.app.controller.analyze(payload.html ?? '', 'dashboard');
      const template = this.app.controller.builder.fromInstances(name, analysis.conversion.instances);
      const rendered = this.app.controller.renderer.render(template);
      const document = this.app.controller.renderer.renderDocument(template);
      const result = await this.exports.exportTemplate(name, document, rendered.scripts, payload.zip ?? true);
      return { status: 200, payload: result };
    }
    if (method === 'GET' && pathname === '/') {
      return { status: 200, payload: { html: renderDashboardHtml() } };
    }
    return { status: 404, payload: { error: 'not-found', path: pathname } };
  }

  async start(options: DashboardOptions = {}): Promise<string> {
    const port = options.port ?? Number(process.env.PAGEFORGEX_DASHBOARD_PORT ?? 12000);
    const host = options.host ?? '0.0.0.0';
    this.server = createServer((request, response) => this.route(request, response));
    await new Promise<void>((resolve) => this.server?.listen(port, host, resolve));
    return `http://${host}:${port}`;
  }

  async stop(): Promise<void> {
    if (!this.server) return;
    await new Promise<void>((resolve, reject) => this.server?.close((error) => (error ? reject(error) : resolve())));
    this.server = null;
  }

  private async route(request: IncomingMessage, response: ServerResponse): Promise<void> {
    const url = new URL(request.url ?? '/', 'http://localhost');
    const body = await readBody(request);
    try {
      const result = await this.handle(request.method ?? 'GET', url.pathname, body);
      if (url.pathname === '/' && result.status === 200) {
        response.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
        response.end((result.payload as { html: string }).html);
        return;
      }
      response.writeHead(result.status, { 'content-type': 'application/json; charset=utf-8' });
      response.end(JSON.stringify(result.payload));
    } catch (error) {
      response.writeHead(500, { 'content-type': 'application/json; charset=utf-8' });
      response.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }));
    }
  }
}

async function readBody(request: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(chunk as Buffer);
  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return {};
  }
}
