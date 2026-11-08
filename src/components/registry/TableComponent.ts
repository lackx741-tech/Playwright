import type { ComponentDefinition, ComponentInstance } from '../../core/types.js';

export const TableComponent: ComponentDefinition = {
  schema: {
    type: 'table',
    category: 'data',
    description: 'Tabular data view with sortable columns.',
    properties: [
      { name: 'columns', type: 'array', required: true, default: [] },
      { name: 'rows', type: 'array', required: false, default: [] },
      { name: 'sortable', type: 'boolean', required: false, default: false },
    ],
    events: [{ name: 'sort', payload: { column: 'string' } }],
    tags: ['grid', 'data'],
  },
  render(instance: ComponentInstance): string {
    const p = instance.properties;
    const columns = Array.isArray(p['columns']) ? (p['columns'] as (string | { key?: string; label?: string })[]) : [];
    const rows = Array.isArray(p['rows']) ? (p['rows'] as Record<string, unknown>[]) : [];
    const header = columns
      .map((column) => {
        const label = typeof column === 'string' ? column : String(column.label ?? column.key ?? '');
        return `<th scope="col">${label}</th>`;
      })
      .join('');
    const body = rows
      .map((row) => {
        const cells = columns
          .map((column) => {
            const key = typeof column === 'string' ? column : String(column.key ?? column.label ?? '');
            return `<td>${String(row[key] ?? '')}</td>`;
          })
          .join('');
        return `<tr>${cells}</tr>`;
      })
      .join('');
    return `<table class="table"${p['sortable'] ? ' data-sortable="true"' : ''}><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table>`;
  },
};
