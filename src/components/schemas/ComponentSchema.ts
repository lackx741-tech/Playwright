import type { ComponentSchema, PropertySchema } from '../../core/types.js';
import { defaultFor } from './PropertySchema.js';

export function defineSchema(schema: ComponentSchema): ComponentSchema {
  return schema;
}

export function defaultsFromSchema(schema: ComponentSchema): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const prop of schema.properties) out[prop.name] = defaultFor(prop);
  return out;
}

export function findProperty(schema: ComponentSchema, name: string): PropertySchema | undefined {
  return schema.properties.find((p) => p.name === name);
}

export type { ComponentSchema };
