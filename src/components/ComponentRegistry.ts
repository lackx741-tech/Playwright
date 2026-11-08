import type { ComponentDefinition, ComponentInstance, ComponentSchema } from '../core/types.js';
import { ButtonComponent } from './registry/ButtonComponent.js';
import { CardComponent } from './registry/CardComponent.js';
import { NavbarComponent } from './registry/NavbarComponent.js';
import { FormComponent } from './registry/FormComponent.js';
import { ModalComponent } from './registry/ModalComponent.js';
import { TableComponent } from './registry/TableComponent.js';
import { ContainerComponent } from './registry/ContainerComponent.js';
import { defaultsFromSchema } from './schemas/ComponentSchema.js';

export const BUILT_IN_COMPONENTS: ComponentDefinition[] = [
  ButtonComponent,
  CardComponent,
  NavbarComponent,
  FormComponent,
  ModalComponent,
  TableComponent,
  ContainerComponent,
];

export class ComponentRegistry {
  private readonly definitions = new Map<string, ComponentDefinition>();

  constructor(definitions: ComponentDefinition[] = BUILT_IN_COMPONENTS) {
    for (const definition of definitions) this.register(definition);
  }

  register(definition: ComponentDefinition): ComponentDefinition {
    const type = definition.schema.type;
    if (!type) throw new Error('Component definition requires a schema type.');
    this.definitions.set(type, definition);
    return definition;
  }

  unregister(type: string): boolean {
    return this.definitions.delete(type);
  }

  has(type: string): boolean {
    return this.definitions.has(type);
  }

  get(type: string): ComponentDefinition | undefined {
    return this.definitions.get(type);
  }

  require(type: string): ComponentDefinition {
    const definition = this.definitions.get(type);
    if (!definition) throw new Error(`Unknown component type: ${type}`);
    return definition;
  }

  list(): ComponentDefinition[] {
    return [...this.definitions.values()];
  }

  schemas(): ComponentSchema[] {
    return this.list().map((definition) => definition.schema);
  }

  create(type: string, properties: Record<string, unknown> = {}, children: ComponentInstance[] = []): ComponentInstance {
    const definition = this.require(type);
    const merged = { ...defaultsFromSchema(definition.schema), ...properties };
    return { id: `${type}-${Math.random().toString(36).slice(2, 9)}`, type, properties: merged, children };
  }
}
