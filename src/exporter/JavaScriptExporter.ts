import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import type { CompileResult } from '../core/types.js';

export class JavaScriptExporter {
  async export(result: CompileResult, outputDir: string): Promise<string[]> {
    await mkdir(outputDir, { recursive: true });
    const written: string[] = [];
    const entry = path.join(outputDir, result.entryPoint);
    await writeFile(entry, result.code, 'utf8');
    written.push(entry);
    if (result.sourceMap) {
      const mapPath = `${entry}.map`;
      await writeFile(mapPath, result.sourceMap, 'utf8');
      written.push(mapPath);
    }
    return written;
  }
}
