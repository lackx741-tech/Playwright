import { JsonStore } from './JsonStore.js';
import path from 'node:path';
import type { TemplateDefinition } from '../core/types.js';

export interface TemplateRecord {
  id: string;
  template: TemplateDefinition;
  createdAt: string;
}

export class TemplateRepository {
  private readonly store: JsonStore<TemplateRecord>;

  constructor(baseDir = 'output/templates') {
    this.store = new JsonStore<TemplateRecord>(path.join(baseDir));
  }

  save(template: TemplateDefinition): Promise<TemplateRecord> {
    return this.store.save({ id: template.name, template, createdAt: new Date().toISOString() });
  }

  get(name: string): Promise<TemplateRecord | null> {
    return this.store.load(name);
  }

  list(): Promise<TemplateRecord[]> {
    return this.store.list();
  }

  remove(name: string): Promise<boolean> {
    return this.store.remove(name);
  }
}
