import { ComponentRegistry } from '../components/ComponentRegistry.js';
import { ComponentDetector } from '../components/ComponentDetector.js';
import { ComponentValidator } from '../components/ComponentValidator.js';
import { TemplateBuilder } from '../templates/TemplateBuilder.js';
import { TemplateCompiler } from '../templates/TemplateCompiler.js';
import { TemplateValidator } from '../templates/TemplateValidator.js';
import { TemplateRenderer } from '../templates/TemplateRenderer.js';
import { HTMLParser } from '../cheerio/HTMLParser.js';
import { DOMAnalyzer } from '../cheerio/DOMAnalyzer.js';
import { JavaScriptCompiler } from '../compiler/JavaScriptCompiler.js';
import { BundleBuilder } from '../compiler/BundleBuilder.js';
import { HTMLToComponent } from '../transformations/HTMLToComponent.js';
import type { ParsedDocument, TemplateDefinition } from '../core/types.js';

export interface AppControllerOptions {
  registry?: ComponentRegistry;
}

export class AppController {
  readonly registry: ComponentRegistry;
  readonly parser = new HTMLParser();
  readonly analyzer = new DOMAnalyzer();
  readonly detector = new ComponentDetector();
  readonly converter: HTMLToComponent;
  readonly validator: ComponentValidator;
  readonly builder: TemplateBuilder;
  readonly compiler = new TemplateCompiler();
  readonly templateValidator: TemplateValidator;
  readonly renderer = new TemplateRenderer();
  readonly jsCompiler = new JavaScriptCompiler();
  readonly bundles = new BundleBuilder();

  constructor(options: AppControllerOptions = {}) {
    this.registry = options.registry ?? new ComponentRegistry();
    this.converter = new HTMLToComponent(this.detector);
    this.validator = new ComponentValidator(this.registry);
    this.builder = new TemplateBuilder(this.registry);
    this.templateValidator = new TemplateValidator(this.registry);
  }

  analyze(html: string, source = 'inline') {
    const document = this.parser.parse(html, source);
    const stats = this.analyzer.analyze(document);
    const conversion = this.converter.convert(document);
    return { document, stats, conversion };
  }

  buildTemplate(name: string, html: string, source = 'inline'): TemplateDefinition {
    const { conversion } = this.analyze(html, source);
    return this.builder.fromInstances(name, conversion.instances);
  }

  compileTemplate(template: TemplateDefinition) {
    const report = this.templateValidator.validate(template);
    const render = this.renderer.render(template);
    return { report, render };
  }

  compileBundle(template: TemplateDefinition, name = template.name) {
    const rendered = this.renderer.render(template);
    const document = this.renderer.renderDocument(template);
    return this.bundles.build({ html: document, bindings: rendered.scripts, name });
  }

  describeDocument(document: ParsedDocument) {
    return {
      title: document.title,
      elementCount: document.elementCount,
      assets: document.assets.length,
      links: document.links.length,
    };
  }
}
