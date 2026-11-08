import type { ComponentDefinition, ComponentInstance } from '../../core/types.js';

export const ContainerComponent: ComponentDefinition = {
  schema: {
    type: 'container',
    category: 'layout',
    description: 'Generic layout container with spacing and alignment.',
    properties: [
      { name: 'layout', type: 'enum', required: false, default: 'block', options: ['block', 'flex', 'grid'] },
      { name: 'spacing', type: 'number', required: false, default: 0 },
      { name: 'align', type: 'enum', required: false, default: 'start', options: ['start', 'center', 'end', 'stretch'] },
      { name: 'tag', type: 'string', required: false, default: 'div' },
    ],
    events: [],
    slots: ['default'],
    tags: ['wrapper', 'layout'],
  },
  render(instance: ComponentInstance): string {
    const p = instance.properties;
    const tag = String(p['tag'] ?? 'div');
    const style = `display:${String(p['layout'] ?? 'block')};gap:${Number(p['spacing'] ?? 0)}px;align-items:${String(p['align'] ?? 'start')};`;
    return `<${tag} class="container container-${p['layout'] ?? 'block'}" style="${style}"></${tag}>`;
  },
};
