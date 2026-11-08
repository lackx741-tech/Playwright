import type { CollectedResource, ValidationIssue } from '../core/types.js';

export class DependencyAuditor {
  audit(resources: CollectedResource[], options: { allowedHosts?: string[] } = {}): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const allowed = options.allowedHosts ?? [];
    for (const resource of resources) {
      if (!/^https?:\/\//i.test(resource.url)) continue;
      let host: string;
      try {
        host = new URL(resource.url).hostname;
      } catch {
        issues.push({ severity: 'warning', code: 'unparsable-dependency', message: `Unable to parse dependency URL: ${resource.url}` });
        continue;
      }
      if (allowed.length > 0 && !allowed.includes(host)) {
        issues.push({ severity: 'info', code: 'external-dependency', message: `External dependency from ${host}`, target: resource.url });
      }
    }
    return issues;
  }
}
