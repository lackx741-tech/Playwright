import type { BundleFile, ValidationIssue, ValidationReport } from '../core/types.js';
import { ScriptPolicy } from './ScriptPolicy.js';

export class ExportValidator {
  constructor(private readonly policy = new ScriptPolicy()) {}

  validate(files: BundleFile[]): ValidationReport {
    const issues: ValidationIssue[] = [];
    for (const file of files) {
      if (file.kind === 'javascript') issues.push(...this.policy.evaluate(file.contents));
      if (file.kind === 'html' && /<script\b/i.test(file.contents)) {
        issues.push({ severity: 'info', code: 'inline-script', message: `Exported HTML "${file.path}" embeds inline scripts.` });
      }
      if (file.contents.length === 0) {
        issues.push({ severity: 'warning', code: 'empty-file', message: `Exported file "${file.path}" is empty.` });
      }
    }
    return { valid: !issues.some((issue) => issue.severity === 'error'), issues };
  }
}
