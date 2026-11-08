import { JsonStore } from './JsonStore.js';
import path from 'node:path';

export interface ProjectRecord {
  id: string;
  name: string;
  source: string;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
}

export class ProjectRepository {
  private readonly store: JsonStore<ProjectRecord>;

  constructor(baseDir = 'output/projects') {
    this.store = new JsonStore<ProjectRecord>(path.join(baseDir));
  }

  create(name: string, source: string, metadata: Record<string, unknown> = {}): Promise<ProjectRecord> {
    const now = new Date().toISOString();
    return this.store.save({ id: slug(name), name, source, createdAt: now, updatedAt: now, metadata });
  }

  get(id: string): Promise<ProjectRecord | null> {
    return this.store.load(id);
  }

  list(): Promise<ProjectRecord[]> {
    return this.store.list();
  }

  async update(id: string, patch: Partial<ProjectRecord>): Promise<ProjectRecord | null> {
    const existing = await this.store.load(id);
    if (!existing) return null;
    return this.store.save({ ...existing, ...patch, id, updatedAt: new Date().toISOString() });
  }

  remove(id: string): Promise<boolean> {
    return this.store.remove(id);
  }
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}
