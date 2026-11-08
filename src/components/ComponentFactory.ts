import { ComponentRegistry } from './ComponentRegistry.js';
import type { ComponentInstance, DetectedComponent, TemplateNode } from '../core/types.js';

export class ComponentFactory {
  constructor(private readonly registry: ComponentRegistry = new ComponentRegistry()) {}

  fromDetected(detected: DetectedComponent[]): ComponentInstance[] {
    return detected
      .filter((item) => this.registry.has(item.type))
      .map((item) => this.registry.create(item.type, item.properties));
  }

  fromTemplateNode(node: TemplateNode): ComponentInstance {
    const children = node.children.map((child) => this.fromTemplateNode(child));
    return this.registry.create(node.componentType, node.properties, children);
  }

  instantiate(type: string, properties: Record<string, unknown> = {}): ComponentInstance {
    return this.registry.create(type, properties);
  }
}
