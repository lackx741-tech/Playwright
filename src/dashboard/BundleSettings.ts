import { compilerConfig, type CompilerConfig } from '../../config/compiler.js';

export class BundleSettings {
  private settings: CompilerConfig;

  constructor(initial: CompilerConfig = compilerConfig) {
    this.settings = { ...initial };
  }

  get(): CompilerConfig {
    return { ...this.settings };
  }

  update(patch: Partial<CompilerConfig>): CompilerConfig {
    this.settings = { ...this.settings, ...patch };
    return this.get();
  }

  reset(): CompilerConfig {
    this.settings = { ...compilerConfig };
    return this.get();
  }
}
