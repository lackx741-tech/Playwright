import type { CollectedResource, ResourceKind } from '../core/types.js';

export class AssetResolver {
  resolve(resources: CollectedResource[], baseUrl = ''): CollectedResource[] {
    return resources.map((resource) => ({ ...resource, url: this.absolute(resource.url, baseUrl) }));
  }

  groupByKind(resources: CollectedResource[]): Record<ResourceKind, string[]> {
    const groups: Record<ResourceKind, string[]> = {
      stylesheet: [],
      script: [],
      image: [],
      font: [],
      media: [],
      other: [],
    };
    for (const resource of resources) groups[resource.kind].push(resource.url);
    return groups;
  }

  inlineAssets(resources: CollectedResource[]): string[] {
    return resources
      .filter((resource) => resource.url.startsWith('data:'))
      .map((resource) => resource.url);
  }

  private absolute(url: string, baseUrl: string): string {
    if (!baseUrl || /^[a-z]+:\/\//i.test(url) || url.startsWith('data:')) return url;
    try {
      return new URL(url, baseUrl).toString();
    } catch {
      return url;
    }
  }
}
