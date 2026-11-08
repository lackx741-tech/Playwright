export interface ParsedArgs {
  command: string;
  flags: Record<string, string | boolean>;
  positionals: string[];
}

export function parseArgs(argv: string[]): ParsedArgs {
  const [command = 'help', ...rest] = argv;
  const flags: Record<string, string | boolean> = {};
  const positionals: string[] = [];
  for (let i = 0; i < rest.length; i += 1) {
    const token = rest[i];
    if (!token) continue;
    if (token.startsWith('--')) {
      const key = token.slice(2);
      if (key.startsWith('no-')) {
        flags[key.slice(3)] = false;
        continue;
      }
      const next = rest[i + 1];
      if (next !== undefined && !next.startsWith('--')) {
        flags[key] = next;
        i += 1;
      } else {
        flags[key] = true;
      }
    } else {
      positionals.push(token);
    }
  }
  return { command, flags, positionals };
}

export function flagString(flags: Record<string, string | boolean>, key: string): string | undefined {
  const value = flags[key];
  return typeof value === 'string' ? value : undefined;
}

export function flagBool(flags: Record<string, string | boolean>, key: string, fallback = false): boolean {
  const value = flags[key];
  if (value === undefined) return fallback;
  return value === true || value === 'true';
}
