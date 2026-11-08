import type { PropertySchema, PropertyType } from '../../core/types.js';

export function property(
  name: string,
  type: PropertyType,
  options: Partial<Omit<PropertySchema, 'name' | 'type'>> = {},
): PropertySchema {
  return { name, type, required: options.required ?? false, ...options };
}

export function defaultFor(schema: PropertySchema): unknown {
  if (schema.default !== undefined) return schema.default;
  switch (schema.type) {
    case 'string':
    case 'html':
      return '';
    case 'number':
      return 0;
    case 'boolean':
      return false;
    case 'enum':
      return schema.options?.[0] ?? '';
    case 'array':
      return [];
    case 'object':
      return {};
    default:
      return null;
  }
}
