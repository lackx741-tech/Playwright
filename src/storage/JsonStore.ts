import { mkdir, readFile, writeFile, readdir, rm } from 'node:fs/promises';
import path from 'node:path';

export class JsonStore<T extends { id: string }> {
  constructor(private readonly directory: string) {}

  private fileFor(id: string): string {
    return path.join(this.directory, `${id}.json`);
  }

  async save(entity: T): Promise<T> {
    await mkdir(this.directory, { recursive: true });
    await writeFile(this.fileFor(entity.id), JSON.stringify(entity, null, 2), 'utf8');
    return entity;
  }

  async load(id: string): Promise<T | null> {
    try {
      const raw = await readFile(this.fileFor(id), 'utf8');
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  async list(): Promise<T[]> {
    let entries: string[];
    try {
      entries = await readdir(this.directory);
    } catch {
      return [];
    }
    const out: T[] = [];
    for (const entry of entries) {
      if (!entry.endsWith('.json')) continue;
      const entity = await this.load(entry.replace(/\.json$/, ''));
      if (entity) out.push(entity);
    }
    return out;
  }

  async remove(id: string): Promise<boolean> {
    try {
      await rm(this.fileFor(id));
      return true;
    } catch {
      return false;
    }
  }
}
