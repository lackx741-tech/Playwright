import { envString } from './env.js';

export interface ExporterConfig {
  outputDir: string;
  bundleDir: string;
  templateDir: string;
  archiveDir: string;
  includeSourceMaps: boolean;
}

const outputDir = envString('PAGEFORGEX_OUTPUT_DIR', 'output');

export const exporterConfig: ExporterConfig = {
  outputDir,
  bundleDir: `${outputDir}/bundles`,
  templateDir: `${outputDir}/templates`,
  archiveDir: `${outputDir}/archives`,
  includeSourceMaps: true,
};
