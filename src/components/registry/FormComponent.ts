import type { ComponentDefinition, ComponentInstance } from '../../core/types.js';

export const FormComponent: ComponentDefinition = {
  schema: {
    type: 'form',
    category: 'input',
    description: 'Form container with declared fields and validation.',
    properties: [
      { name: 'action', type: 'string', required: false, default: '' },
      { name: 'method', type: 'enum', required: false, default: 'post', options: ['get', 'post'] },
      { name: 'fields', type: 'array', required: false, default: [] },
      { name: 'validation', type: 'object', required: false, default: {} },
    ],
    events: [{ name: 'submit', payload: { fields: 'object' } }],
    slots: ['fields', 'actions'],
    tags: ['input'],
  },
  render(instance: ComponentInstance): string {
    const p = instance.properties;
    const fields = Array.isArray(p['fields']) ? (p['fields'] as { name?: string; label?: string; type?: string; required?: boolean }[]) : [];
    const body = fields
      .map((field) => {
        const name = String(field.name ?? 'field');
        const label = `<label class="form-label" for="${name}">${String(field.label ?? name)}</label>`;
        const required = field.required ? ' required' : '';
        return `<div class="form-field">${label}<input class="form-input" id="${name}" name="${name}" type="${String(field.type ?? 'text')}"${required}></div>`;
      })
      .join('');
    return `<form class="form" action="${String(p['action'] ?? '')}" method="${String(p['method'] ?? 'post')}">${body}</form>`;
  },
  bind(): string {
    return "document.querySelectorAll('form.form').forEach((form)=>form.addEventListener('submit',(event)=>{event.preventDefault();form.dispatchEvent(new CustomEvent('pageforgex:submit',{detail:{}}));}));";
  },
};
