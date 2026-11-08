import { ComponentRegistry } from '../components/ComponentRegistry.js';
import type { ComponentDefinition, ComponentInstance, TemplateDefinition, TemplateNode } from '../core/types.js';

export interface TemplateRenderResult {
  html: string;
  bindings: string[];
  usedComponents: string[];
}

export class TemplateCompiler {
  constructor(private readonly registry: ComponentRegistry = new ComponentRegistry()) {}

  compile(template: TemplateDefinition): TemplateRenderResult {
    const usedComponents = new Set<string>();
    const bindings = new Set<string>();
    const html = this.renderNode(template.root, usedComponents, bindings);
    return { html, bindings: [...bindings], usedComponents: [...usedComponents] };
  }

  private renderNode(node: TemplateNode, used: Set<string>, bindings: Set<string>): string {
    const definition = this.registry.get(node.componentType);
    if (!definition) return `<!-- unknown component: ${node.componentType} -->`;
    used.add(node.componentType);
    if (definition.bind) bindings.add(definition.bind(this.toInstance(node)));
    const inner = node.children.map((child) => this.renderNode(child, used, bindings)).join('');
    const rendered = definition.render(this.toInstance(node));
    if (inner && rendered.includes('></')) {
      return rendered.replace('></', `>${inner}</`);
    }
    return rendered;
  }

  private toInstance(node: TemplateNode): ComponentInstance {
    return {
      id: `${node.componentType}-node`,
      type: node.componentType,
      properties: node.properties,
      children: node.children.map((child) => this.toInstance(child)),
    };
  }

  definitionFor(type: string): ComponentDefinition | undefined {
    return this.registry.get(type);
  }
}
