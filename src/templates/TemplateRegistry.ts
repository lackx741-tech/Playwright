import type { TemplateDefinition } from '../core/types.js';

export class TemplateRegistry {
  private readonly templates = new Map<string, TemplateDefinition>();

  register(template: TemplateDefinition): TemplateDefinition {
    if (!template.name) throw new Error('Template requires a name.');
    this.templates.set(template.name, template);
    return template;
  }

  get(name: string): TemplateDefinition | undefined {
    return this.templates.get(name);
  }

  require(name: string): TemplateDefinition {
    const template = this.templates.get(name);
    if (!template) throw new Error(`Unknown template: ${name}`);
    return template;
  }

  list(): TemplateDefinition[] {
    return [...this.templates.values()];
  }

  remove(name: string): boolean {
    return this.templates.delete(name);
  }
}
