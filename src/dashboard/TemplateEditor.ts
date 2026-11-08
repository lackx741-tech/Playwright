import { TemplateBuilder } from '../templates/TemplateBuilder.js';
import { TemplateRegistry } from '../templates/TemplateRegistry.js';
import { TemplateValidator } from '../templates/TemplateValidator.js';
import { TemplateRenderer } from '../templates/TemplateRenderer.js';
import { ComponentRegistry } from '../components/ComponentRegistry.js';
import type { TemplateDefinition } from '../core/types.js';

export class TemplateEditor {
  private readonly builder: TemplateBuilder;
  private readonly validator: TemplateValidator;
  private readonly renderer = new TemplateRenderer();
  readonly registry = new TemplateRegistry();

  constructor(components = new ComponentRegistry()) {
    this.builder = new TemplateBuilder(components);
    this.validator = new TemplateValidator(components);
  }

  create(name: string, rootType = 'container'): TemplateDefinition {
    return this.registry.register(this.builder.create(name, rootType));
  }

  addComponent(templateName: string, type: string, properties: Record<string, unknown> = {}): TemplateDefinition {
    const template = this.registry.require(templateName);
    this.builder.addComponent(template, type, properties);
    return this.registry.register(template);
  }

  render(templateName: string): string {
    return this.renderer.renderDocument(this.registry.require(templateName));
  }

  validate(templateName: string) {
    return this.validator.validate(this.registry.require(templateName));
  }

  list(): TemplateDefinition[] {
    return this.registry.list();
  }
}
