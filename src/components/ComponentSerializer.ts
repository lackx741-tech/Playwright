import type { ComponentDefinition, ComponentInstance, TemplateNode } from '../core/types.js';

export class ComponentSerializer {
  toTemplateNode(instance: ComponentInstance): TemplateNode {
    return {
      componentType: instance.type,
      properties: instance.properties,
      children: instance.children.map((child) => this.toTemplateNode(child)),
    };
  }

  serializeInstance(instance: ComponentInstance): string {
    return JSON.stringify(instance, null, 2);
  }

  serializeDefinition(definition: ComponentDefinition): string {
    return JSON.stringify(definition.schema, null, 2);
  }

  serializeRegistry(definitions: ComponentDefinition[]): string {
    return JSON.stringify(definitions.map((d) => d.schema), null, 2);
  }

  deserializeInstance(json: string): ComponentInstance {
    return JSON.parse(json) as ComponentInstance;
  }
}
