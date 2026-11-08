import { envBool, envNumber } from './env.js';

export interface PlaywrightConfig {
  headless: boolean;
  navigationTimeoutMs: number;
  actionTimeoutMs: number;
  viewport: { width: number; height: number };
  userAgent: string | null;
  blockPrivateNetwork: boolean;
  blockResourceTypes: string[];
}

export const playwrightConfig: PlaywrightConfig = {
  headless: envBool('PAGEFORGEX_BROWSER_HEADLESS', true),
  navigationTimeoutMs: envNumber('PAGEFORGEX_NAV_TIMEOUT_MS', 30_000),
  actionTimeoutMs: envNumber('PAGEFORGEX_ACTION_TIMEOUT_MS', 10_000),
  viewport: { width: 1440, height: 900 },
  userAgent: process.env.PAGEFORGEX_USER_AGENT ?? null,
  blockPrivateNetwork: !envBool('PAGEFORGEX_ALLOW_PRIVATE_NETWORK', false),
  blockResourceTypes: ['media'],
};
