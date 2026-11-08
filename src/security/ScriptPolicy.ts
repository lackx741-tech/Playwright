import type { ValidationIssue } from '../core/types.js';

export interface ScriptPolicyOptions {
  allowEval?: boolean;
  allowRemote?: boolean;
  maxBytes?: number;
}

const FORBIDDEN = [
  { pattern: /\beval\s*\(/, code: 'eval-usage', message: 'Generated script uses eval().' },
  { pattern: /new\s+Function\s*\(/, code: 'function-constructor', message: 'Generated script uses the Function constructor.' },
  { pattern: /document\.write\s*\(/, code: 'document-write', message: 'Generated script uses document.write().' },
];

export class ScriptPolicy {
  evaluate(code: string, options: ScriptPolicyOptions = {}): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    if (!options.allowEval) {
      for (const rule of FORBIDDEN) {
        if (rule.pattern.test(code)) {
          issues.push({ severity: 'warning', code: rule.code, message: rule.message });
        }
      }
    }
    if (!options.allowRemote && /https?:\/\/[^"'\s]+/.test(code)) {
      issues.push({ severity: 'info', code: 'remote-reference', message: 'Generated script references remote URLs.' });
    }
    const maxBytes = options.maxBytes ?? 2_000_000;
    if (Buffer.byteLength(code, 'utf8') > maxBytes) {
      issues.push({ severity: 'warning', code: 'bundle-size', message: `Bundle exceeds ${maxBytes} bytes.` });
    }
    return issues;
  }
}
