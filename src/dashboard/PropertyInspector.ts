import { ComponentRegistry } from '../components/ComponentRegistry.js';
import { ComponentValidator } from '../components/ComponentValidator.js';
import type { PropertySchema, ValidationReport } from '../core/types.js';

export class PropertyInspector {
  constructor(
    private readonly registry = new ComponentRegistry(),
    private readonly validator = new ComponentValidator(this.registry),
  ) {}

  properties(type: string): PropertySchema[] {
    return this.registry.get(type)?.schema.properties ?? [];
  }

  inspect(type: string, properties: Record<string, unknown>): ValidationReport {
    return this.validator.validateInstance({ id: `${type}-inspect`, type, properties, children: [] });
  }
}
