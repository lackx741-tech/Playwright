import type { BundleFile, ExportManifest } from '../core/types.js';

export class ManifestGenerator {
  generate(name: string, files: BundleFile[]): ExportManifest {
    return {
      name,
      generatedAt: new Date().toISOString(),
      files: files.map((file) => ({ path: file.path, kind: file.kind, bytes: Buffer.byteLength(file.contents, 'utf8') })),
      totalBytes: files.reduce((total, file) => total + Buffer.byteLength(file.contents, 'utf8'), 0),
    };
  }

  serialize(manifest: ExportManifest): string {
    return JSON.stringify(manifest, null, 2);
  }
}
