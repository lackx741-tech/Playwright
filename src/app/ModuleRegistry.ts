export type ModuleFactory<T> = () => T;

export interface ModuleDescriptor<T = unknown> {
  name: string;
  factory: ModuleFactory<T>;
  instance?: T;
  initializedAt?: string;
}

export class ModuleRegistry {
  private readonly modules = new Map<string, ModuleDescriptor>();

  register<T>(name: string, factory: ModuleFactory<T>): void {
    this.modules.set(name, { name, factory: factory as ModuleFactory<unknown> });
  }

  resolve<T>(name: string): T {
    const descriptor = this.modules.get(name);
    if (!descriptor) throw new Error(`Module not registered: ${name}`);
    if (descriptor.instance === undefined) {
      descriptor.instance = descriptor.factory();
      descriptor.initializedAt = new Date().toISOString();
    }
    return descriptor.instance as T;
  }

  has(name: string): boolean {
    return this.modules.has(name);
  }

  names(): string[] {
    return [...this.modules.keys()];
  }

  status(): { name: string; initialized: boolean; initializedAt: string | null }[] {
    return [...this.modules.values()].map((descriptor) => ({
      name: descriptor.name,
      initialized: descriptor.instance !== undefined,
      initializedAt: descriptor.initializedAt ?? null,
    }));
  }
}
