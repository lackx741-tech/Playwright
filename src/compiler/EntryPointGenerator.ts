export interface EntryPointOptions {
  namespace?: string;
  mountSelector?: string;
  html?: string;
  bindings?: string[];
}

export class EntryPointGenerator {
  generate(options: EntryPointOptions = {}): string {
    const namespace = options.namespace ?? 'PageForgeX';
    const selector = options.mountSelector ?? '#app';
    const lines: string[] = [];
    lines.push(`${namespace}.injectStyles();`);
    if (options.html) {
      lines.push(`const template = ${JSON.stringify(options.html)};`);
      lines.push(`const host = document.querySelector(${JSON.stringify(selector)});`);
      lines.push("if (host) host.innerHTML = template;");
    }
    for (const binding of options.bindings ?? []) lines.push(binding);
    lines.push(`${namespace}.emit('ready', { mounted: true });`);
    return lines.join('\n');
  }
}
