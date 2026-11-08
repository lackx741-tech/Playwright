import { ExportManager } from '../exporter/ExportManager.js';
import { BundleBuilder } from '../compiler/BundleBuilder.js';
import type { ExportResult } from '../exporter/ExportManager.js';

export class ExportPanel {
  constructor(
    private readonly bundles = new BundleBuilder(),
    private readonly exporter = new ExportManager(),
  ) {}

  async exportTemplate(name: string, html: string, bindings: string[] = [], zip = true): Promise<ExportResult> {
    const built = this.bundles.build({ html, bindings, name });
    return this.exporter.export({ name, html, compile: built.compile, files: built.files, zip });
  }
}
