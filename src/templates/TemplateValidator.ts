import { ComponentRegistry } from '../components/ComponentRegistry.js';
import { LayoutEngine } from './LayoutEngine.js';
import type { TemplateDefinition, ValidationIssue, ValidationReport } from '../core/types.js';

export class TemplateValidator {
  private readonly layout = new LayoutEngine();

  constructor(private readonly registry: ComponentRegistry = new ComponentRegistry()) {}

  validate(template: TemplateDefinition): ValidationReport {
    const issues: ValidationIssue[] = [];
    if (!template.name) issues.push({ severity: 'error', code: 'template-name', message: 'Template requires a name.' });
    const depth = this.layout.depth(template.root);
    if (depth > 24) issues.push({ severity: 'warning', code: 'template-depth', message: `Template depth ${depth} exceeds recommended limit.` });

    const walk = (node: { componentType: string; children: { componentType: string; children: unknown[] }[] }) => {
      if (!this.registry.has(node.componentType)) {
        issues.push({ severity: 'error', code: 'unknown-component', message: `Unknown component type: ${node.componentType}`, target: node.componentType });
      }
      for (const child of node.children) walk(child as typeof node);
    };
    walk(template.root);

    return { valid: !issues.some((issue) => issue.severity === 'error'), issues };
  }
}
