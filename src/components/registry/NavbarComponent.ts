import type { ComponentDefinition, ComponentInstance } from '../../core/types.js';

export const NavbarComponent: ComponentDefinition = {
  schema: {
    type: 'navbar',
    category: 'navigation',
    description: 'Top-level navigation bar with logo and links.',
    properties: [
      { name: 'logo', type: 'string', required: false, default: 'Brand' },
      { name: 'links', type: 'array', required: false, default: [] },
      { name: 'theme', type: 'enum', required: false, default: 'light', options: ['light', 'dark', 'transparent'] },
    ],
    events: [{ name: 'navigate', payload: { href: 'string' } }],
    slots: ['links'],
    tags: ['nav', 'header'],
  },
  render(instance: ComponentInstance): string {
    const p = instance.properties;
    const links = Array.isArray(p['links']) ? (p['links'] as { label?: string; href?: string }[]) : [];
    const items = links
      .map((link) => `<a class="navbar-link" href="${String(link.href ?? '#')}">${String(link.label ?? '')}</a>`)
      .join('');
    return `<nav class="navbar navbar-${p['theme'] ?? 'light'}"><span class="navbar-brand">${String(p['logo'] ?? '')}</span><div class="navbar-links">${items}</div></nav>`;
  },
};
