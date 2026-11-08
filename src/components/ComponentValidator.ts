import type { ComponentDefinition, ComponentInstance, ValidationIssue, ValidationReport } from '../core/types.js';
import { ComponentRegistry } from './ComponentRegistry.js';

export class ComponentValidator {
  constructor(private readonly registry: ComponentRegistry = new ComponentRegistry()) {}

  validateInstance(instance: ComponentInstance): ValidationReport {
    const issues: ValidationIssue[] = [];
    const definition = this.registry.get(instance.type);
    if (!definition) {
      issues.push({ severity: 'error', code: 'unknown-component', message: `Unknown component type: ${instance.type}`, target: instance.id });
      return { valid: false, issues };
    }
    for (const property of definition.schema.properties) {
      const value = instance.properties[property.name];
      if (property.required && (value === undefined || value === '' || value === null)) {
        issues.push({ severity: 'error', code: 'missing-property', message: `Missing required property "${property.name}"`, target: instance.type });
      }
      if (value !== undefined && !this.matchesType(property.type, value)) {
        issues.push({ severity: 'warning', code: 'property-type', message: `Property "${property.name}" expected ${property.type}`, target: instance.type });
      }
      if (property.type === 'enum' && property.options && typeof value === 'string' && !property.options.includes(value)) {
        issues.push({ severity: 'warning', code: 'enum-option', message: `Property "${property.name}" value "${value}" not in allowed options`, target: instance.type });
      }
    }
    for (const child of instance.children) {
      issues.push(...this.validateInstance(child).issues);
    }
    return { valid: !issues.some((issue) => issue.severity === 'error'), issues };
  }

  validateDefinition(definition: ComponentDefinition): ValidationReport {
    const issues: ValidationIssue[] = [];
    if (!definition.schema.type) issues.push({ severity: 'error', code: 'missing-type', message: 'Component schema requires a type.' });
    const seen = new Set<string>();
    for (const property of definition.schema.properties) {
      if (seen.has(property.name)) {
        issues.push({ severity: 'error', code: 'duplicate-property', message: `Duplicate property "${property.name}"`, target: definition.schema.type });
      }
      seen.add(property.name);
    }
    return { valid: !issues.some((issue) => issue.severity === 'error'), issues };
  }

  private matchesType(type: string, value: unknown): boolean {
    switch (type) {
      case 'string':
      case 'html':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number';
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'enum':
        return typeof value === 'string';
      default:
        return true;
    }
  }
}
