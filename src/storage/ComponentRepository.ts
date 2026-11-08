import { JsonStore } from './JsonStore.js';
import path from 'node:path';
import type { ComponentSchema } from '../core/types.js';

export interface ComponentRecord {
  id: string;
  schema: ComponentSchema;
  createdAt: string;
}

export class ComponentRepository {
  private readonly store: JsonStore<ComponentRecord>;

  constructor(baseDir = 'output/components') {
    this.store = new JsonStore<ComponentRecord>(path.join(baseDir));
  }

  save(schema: ComponentSchema): Promise<ComponentRecord> {
    return this.store.save({ id: schema.type, schema, createdAt: new Date().toISOString() });
  }

  get(type: string): Promise<ComponentRecord | null> {
    return this.store.load(type);
  }

  list(): Promise<ComponentRecord[]> {
    return this.store.list();
  }

  remove(type: string): Promise<boolean> {
    return this.store.remove(type);
  }
}
