import { playwrightConfig, type PlaywrightConfig } from '../../config/playwright.js';
import type { ValidationIssue } from '../core/types.js';

const PRIVATE_HOST = /^(localhost|127\.|0\.0\.0\.0|10\.|192\.168\.|169\.254\.|::1$)/i;
const PRIVATE_172 = /^172\.(1[6-9]|2\d|3[01])\./;

export class URLValidator {
  constructor(private readonly config: Pick<PlaywrightConfig, 'blockPrivateNetwork'> = playwrightConfig) {}

  validate(rawUrl: string): { allowed: boolean; url: string | null; issues: ValidationIssue[] } {
    const issues: ValidationIssue[] = [];
    let parsed: URL;
    try {
      parsed = new URL(rawUrl);
    } catch {
      issues.push({ severity: 'error', code: 'invalid-url', message: `Not a valid absolute URL: ${rawUrl}`, target: rawUrl });
      return { allowed: false, url: null, issues };
    }
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      issues.push({ severity: 'error', code: 'unsupported-protocol', message: `Unsupported protocol: ${parsed.protocol}`, target: rawUrl });
    }
    if (this.config.blockPrivateNetwork && this.isPrivateHost(parsed.hostname)) {
      issues.push({ severity: 'error', code: 'private-network', message: `Blocked private network target: ${parsed.hostname}`, target: rawUrl });
    }
    const allowed = !issues.some((issue) => issue.severity === 'error');
    return { allowed, url: allowed ? parsed.toString() : null, issues };
  }

  isPrivateHost(hostname: string): boolean {
    return PRIVATE_HOST.test(hostname) || PRIVATE_172.test(hostname);
  }

  assertAllowed(rawUrl: string): string {
    const result = this.validate(rawUrl);
    if (!result.allowed || !result.url) {
      throw new Error(result.issues.map((issue) => issue.message).join('; '));
    }
    return result.url;
  }
}
