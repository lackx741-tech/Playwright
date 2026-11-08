import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import type { CollectedResource } from '../core/types.js';

export class AssetExporter {
  async export(resources: CollectedResource[], outputDir: string, contents: Record<string, string> = {}): Promise<string[]> {
    await mkdir(outputDir, { recursive: true });
    const written: string[] = [];
    for (const resource of resources) {
      const body = contents[resource.url];
      if (body === undefined) continue;
      const fileName = resource.url.split('/').pop() ?? `asset-${written.length}`;
      const target = path.join(outputDir, fileName.split('?')[0] ?? fileName);
      await writeFile(target, body, 'utf8');
      written.push(target);
    }
    return written;
  }
}
