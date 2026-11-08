export interface RuntimeOptions {
  namespace?: string;
  includeCss?: string;
}

export class RuntimeGenerator {
  generate(options: RuntimeOptions = {}): string {
    const namespace = options.namespace ?? 'PageForgeX';
    const css = options.includeCss ? `const css = ${JSON.stringify(options.includeCss)};` : 'const css = null;';
    return `const ${namespace} = (() => {
  ${css}
  const registry = new Map();
  const listeners = new Map();

  function register(name, factory) {
    registry.set(name, factory);
  }

  function mount(name, target, props = {}) {
    const factory = registry.get(name);
    if (!factory) throw new Error('Unknown component: ' + name);
    const node = typeof factory === 'function' ? factory(props) : factory;
    if (typeof target === 'string') {
      const el = document.querySelector(target);
      if (el) el.appendChild(node);
      return el;
    }
    if (target) target.appendChild(node);
    return node;
  }

  function on(event, handler) {
    if (!listeners.has(event)) listeners.set(event, new Set());
    listeners.get(event).add(handler);
    return () => listeners.get(event)?.delete(handler);
  }

  function emit(event, detail) {
    const handlers = listeners.get(event);
    if (!handlers) return;
    for (const handler of handlers) handler(detail);
  }

  function injectStyles() {
    if (!css || typeof document === 'undefined') return;
    const style = document.createElement('style');
    style.setAttribute('data-pageforgex', 'true');
    style.textContent = css;
    document.head.appendChild(style);
  }

  return { register, mount, on, emit, injectStyles, registry };
})();

if (typeof window !== 'undefined') window.PageForgeX = ${namespace};
`;
  }
}
