import { exporterConfig, type ExporterConfig } from '../../config/exporter.js';
import { JavaScriptExporter } from './JavaScriptExporter.js';
import { HTMLExporter } from './HTMLExporter.js';
import { ZIPExporter } from './ZIPExporter.js';
import { ManifestGenerator } from './ManifestGenerator.js';
import { ExportValidator } from '../security/ExportValidator.js';
import type { BundleFile, CompileResult, ExportManifest } from '../core/types.js';

export interface ExportInput {
  name: string;
  html: string;
  compile: CompileResult;
  files: BundleFile[];
  zip?: boolean;
}

export interface ExportResult {
  manifest: ExportManifest;
  written: string[];
  archive: string | null;
  report: ReturnType<ExportValidator['validate']>;
}

export class ExportManager {
  private readonly js = new JavaScriptExporter();
  private readonly html = new HTMLExporter();
  private readonly zip = new ZIPExporter();
  private readonly manifests = new ManifestGenerator();
  private readonly validator = new ExportValidator();

  constructor(private readonly config: ExporterConfig = exporterConfig) {}

  async export(input: ExportInput): Promise<ExportResult> {
    const report = this.validator.validate(input.files);
    const written: string[] = [];
    written.push(...(await this.js.export(input.compile, this.config.bundleDir)));
    written.push(await this.html.export(input.html, this.config.templateDir, `${input.name}.html`));

    const manifest = this.manifests.generate(input.name, input.files);
    const manifestPath = `${this.config.templateDir}/${input.name}.manifest.json`;
    await this.html.export(this.manifests.serialize(manifest), this.config.templateDir, `${input.name}.manifest.json`);

    let archive: string | null = null;
    if (input.zip ?? true) {
      archive = await this.zip.export(input.files, this.config.archiveDir, `${input.name}.zip`);
      written.push(archive);
    }
    written.push(manifestPath);
    return { manifest, written, archive, report };
  }
}
