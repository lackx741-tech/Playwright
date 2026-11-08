import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

export class HTMLExporter {
  async export(html: string, outputDir: string, fileName = 'index.html'): Promise<string> {
    await mkdir(outputDir, { recursive: true });
    const target = path.join(outputDir, fileName);
    await writeFile(target, html, 'utf8');
    return target;
  }
}
