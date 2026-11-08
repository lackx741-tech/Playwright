import type { CollectedResource } from '../core/types.js';

export interface DependencyGraph {
  roots: string[];
  edges: Record<string, string[]>;
  order: string[];
}

export class DependencyResolver {
  resolve(resources: CollectedResource[]): DependencyGraph {
    const edges: Record<string, string[]> = {};
    for (const resource of resources) {
      edges[resource.url] = resources
        .filter((other) => other.url !== resource.url && this.references(resource, other.url))
        .map((other) => other.url);
    }
    const order = this.topological([...new Set(resources.map((r) => r.url))], edges);
    return { roots: Object.keys(edges).filter((url) => !Object.values(edges).some((list) => list.includes(url))), edges, order };
  }

  private references(source: CollectedResource, candidate: string): boolean {
    return Object.values(source.attributes).some((value) => value.includes(candidate));
  }

  private topological(nodes: string[], edges: Record<string, string[]>): string[] {
    const visited = new Set<string>();
    const order: string[] = [];
    const visit = (node: string, stack: Set<string>) => {
      if (visited.has(node) || stack.has(node)) return;
      stack.add(node);
      for (const next of edges[node] ?? []) visit(next, stack);
      stack.delete(node);
      visited.add(node);
      order.push(node);
    };
    for (const node of nodes) visit(node, new Set());
    return order;
  }
}
