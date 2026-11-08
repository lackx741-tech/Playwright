import type { ComponentDefinition, ComponentInstance } from '../../core/types.js';

export const ButtonComponent: ComponentDefinition = {
  schema: {
    type: 'button',
    category: 'action',
    description: 'Clickable call-to-action control.',
    properties: [
      { name: 'label', type: 'string', required: true, default: 'Button' },
      { name: 'color', type: 'enum', required: false, default: 'primary', options: ['primary', 'secondary', 'danger', 'ghost'] },
      { name: 'size', type: 'enum', required: false, default: 'md', options: ['sm', 'md', 'lg'] },
      { name: 'href', type: 'string', required: false, default: '' },
      { name: 'disabled', type: 'boolean', required: false, default: false },
    ],
    events: [{ name: 'click', payload: { label: 'string' } }],
    tags: ['cta', 'action'],
  },
  render(instance: ComponentInstance): string {
    const p = instance.properties;
    const classes = `btn btn-${p['color'] ?? 'primary'} btn-${p['size'] ?? 'md'}`;
    const disabled = p['disabled'] ? ' disabled' : '';
    const label = escapeHtml(String(p['label'] ?? 'Button'));
    if (p['href']) {
      return `<a class="${classes}" href="${escapeAttribute(String(p['href']))}"${disabled}>${label}</a>`;
    }
    return `<button class="${classes}" type="button"${disabled}>${label}</button>`;
  },
  bind(): string {
    return "document.querySelectorAll('.btn').forEach((el)=>el.addEventListener('click',()=>el.dispatchEvent(new CustomEvent('pageforgex:click',{detail:{label:el.textContent}}))));";
  },
};

function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttribute(value: string): string {
  return escapeHtml(value).replace(/"/g, '&quot;');
}
