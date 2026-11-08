import type { ComponentDefinition, ComponentInstance } from '../../core/types.js';

export const CardComponent: ComponentDefinition = {
  schema: {
    type: 'card',
    category: 'content',
    description: 'Content container with title, media and description.',
    properties: [
      { name: 'title', type: 'string', required: true, default: 'Card title' },
      { name: 'description', type: 'string', required: false, default: '' },
      { name: 'image', type: 'string', required: false, default: '' },
      { name: 'footer', type: 'string', required: false, default: '' },
    ],
    events: [{ name: 'click' }],
    slots: ['default', 'footer'],
    tags: ['panel', 'tile'],
  },
  render(instance: ComponentInstance): string {
    const p = instance.properties;
    const image = p['image'] ? `<img class="card-image" src="${String(p['image'])}" alt="">` : '';
    const description = p['description'] ? `<p class="card-description">${String(p['description'])}</p>` : '';
    const footer = p['footer'] ? `<footer class="card-footer">${String(p['footer'])}</footer>` : '';
    return `<article class="card">${image}<div class="card-body"><h3 class="card-title">${String(p['title'] ?? '')}</h3>${description}</div>${footer}</article>`;
  },
};
