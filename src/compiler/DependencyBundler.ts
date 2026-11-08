import type { CollectedResource } from '../core/types.js';

export interface DependencyBundle {
  externals: string[];
  locals: string[];
  imports: string[];
}

export class DependencyBundler {
  bundle(resources: CollectedResource[]): DependencyBundle {
    const externals: string[] = [];
    const locals: string[] = [];
    const imports: string[] = [];
    for (const resource of resources) {
      if (resource.kind !== 'script') continue;
      if (/^https?:\/\//i.test(resource.url)) {
        externals.push(resource.url);
        imports.push(`// external: ${resource.url}`);
      } else {
        locals.push(resource.url);
      }
    }
    return { externals, locals, imports };
  }
}
