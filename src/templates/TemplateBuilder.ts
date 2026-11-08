import { ComponentRegistry } from '../components/ComponentRegistry.js';
import { ComponentSerializer } from '../components/ComponentSerializer.js';
import { LayoutEngine } from './LayoutEngine.js';
import type { ComponentInstance, TemplateDefinition, TemplateNode } from '../core/types.js';

export class TemplateBuilder {
  private readonly serializer = new ComponentSerializer();
  private readonly layout = new LayoutEngine();

  constructor(private readonly registry: ComponentRegistry = new ComponentRegistry()) {}

  create(name: string, rootType = 'container', properties: Record<string, unknown> = {}): TemplateDefinition {
    const root = this.registry.create(rootType, properties);
    return {
      name,
      root: this.serializer.toTemplateNode(root),
      assets: [],
      metadata: { createdAt: new Date().toISOString(), componentCount: 1 },
    };
  }

  addComponent(template: TemplateDefinition, type: string, properties: Record<string, unknown> = {}, parentType?: string): TemplateDefinition {
    const instance = this.registry.create(type, properties);
    const node = this.serializer.toTemplateNode(instance);
    const parent = parentType ? this.layout.find(template.root, (n) => n.componentType === parentType) : null;
    if (parent) parent.children.push(node);
    else template.root.children.push(node);
    template.metadata['componentCount'] = this.layout.count(template.root);
    return template;
  }

  fromInstances(name: string, instances: ComponentInstance[]): TemplateDefinition {
    const root = this.registry.create('container', { layout: 'block' }, instances);
    return {
      name,
      root: this.serializer.toTemplateNode(root),
      assets: [],
      metadata: { createdAt: new Date().toISOString(), componentCount: this.layout.count(this.serializer.toTemplateNode(root)) },
    };
  }

  replaceRoot(template: TemplateDefinition, node: TemplateNode): TemplateDefinition {
    template.root = node;
    template.metadata['componentCount'] = this.layout.count(node);
    return template;
  }
}
