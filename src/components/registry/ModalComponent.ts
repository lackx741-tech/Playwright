import type { ComponentDefinition, ComponentInstance } from '../../core/types.js';

export const ModalComponent: ComponentDefinition = {
  schema: {
    type: 'modal',
    category: 'overlay',
    description: 'Dialog overlay with visibility control.',
    properties: [
      { name: 'title', type: 'string', required: true, default: 'Modal' },
      { name: 'content', type: 'html', required: false, default: '' },
      { name: 'visible', type: 'boolean', required: false, default: false },
    ],
    events: [{ name: 'open' }, { name: 'close' }],
    slots: ['default'],
    tags: ['dialog', 'overlay'],
  },
  render(instance: ComponentInstance): string {
    const p = instance.properties;
    const hidden = p['visible'] ? '' : ' hidden';
    return `<div class="modal" role="dialog" aria-modal="true"${hidden}><div class="modal-content"><h2 class="modal-title">${String(p['title'] ?? '')}</h2><div class="modal-body">${String(p['content'] ?? '')}</div><button class="modal-close" type="button" aria-label="Close">×</button></div></div>`;
  },
  bind(): string {
    return "document.querySelectorAll('.modal').forEach((modal)=>{modal.querySelector('.modal-close')?.addEventListener('click',()=>{modal.hidden=true;modal.dispatchEvent(new CustomEvent('pageforgex:close'));});});";
  },
};
