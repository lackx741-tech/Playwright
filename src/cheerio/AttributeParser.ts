export class AttributeParser {
  parse(attributes: Record<string, string>): Record<string, string | boolean | number> {
    const result: Record<string, string | boolean | number> = {};
    for (const [key, value] of Object.entries(attributes)) {
      result[key] = this.coerce(value);
    }
    return result;
  }

  coerce(value: string): string | boolean | number {
    if (value === '') return true;
    if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  }

  extractClasses(attributes: Record<string, string>): string[] {
    const raw = attributes['class'] ?? '';
    return raw.split(/\s+/).filter(Boolean);
  }

  extractDataset(attributes: Record<string, string>): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(attributes)) {
      if (key.startsWith('data-')) out[key.slice(5)] = value;
    }
    return out;
  }
}
