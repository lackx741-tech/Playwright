export interface SourceMap {
  version: 3;
  file: string;
  sources: string[];
  sourcesContent: string[];
  names: string[];
  mappings: string;
}

export class SourceMapGenerator {
  generate(file: string, sources: { name: string; content: string }[]): SourceMap {
    return {
      version: 3,
      file,
      sources: sources.map((source) => source.name),
      sourcesContent: sources.map((source) => source.content),
      names: [],
      mappings: '',
    };
  }

  serialize(map: SourceMap): string {
    return JSON.stringify(map);
  }

  appendComment(code: string, mapFile: string): string {
    return `${code}\n//# sourceMappingURL=${mapFile}\n`;
  }
}
