import { JsonStore } from './JsonStore.js';
import path from 'node:path';
import type { BundleManifest } from '../core/types.js';

export interface BuildRecord {
  id: string;
  name: string;
  manifest: BundleManifest;
  createdAt: string;
}

export class BuildRepository {
  private readonly store: JsonStore<BuildRecord>;

  constructor(baseDir = 'output/builds') {
    this.store = new JsonStore<BuildRecord>(path.join(baseDir));
  }

  save(manifest: BundleManifest): Promise<BuildRecord> {
    const id = `${manifest.name}-${Date.now()}`;
    return this.store.save({ id, name: manifest.name, manifest, createdAt: new Date().toISOString() });
  }

  get(id: string): Promise<BuildRecord | null> {
    return this.store.load(id);
  }

  list(): Promise<BuildRecord[]> {
    return this.store.list();
  }

  async latest(name?: string): Promise<BuildRecord | null> {
    const records = await this.list();
    const filtered = name ? records.filter((record) => record.name === name) : records;
    return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null;
  }
}
