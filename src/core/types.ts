export type PropertyType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'enum'
  | 'array'
  | 'object'
  | 'html';

export interface PropertySchema {
  name: string;
  type: PropertyType;
  required: boolean;
  default?: unknown;
  options?: string[];
  description?: string;
}

export interface EventSchema {
  name: string;
  description?: string;
  payload?: Record<string, PropertyType>;
}

export interface ComponentSchema {
  type: string;
  category: string;
  description?: string;
  properties: PropertySchema[];
  events: EventSchema[];
  slots?: string[];
  tags?: string[];
}

export interface ComponentInstance {
  id: string;
  type: string;
  properties: Record<string, unknown>;
  children: ComponentInstance[];
}

export interface ComponentDefinition {
  schema: ComponentSchema;
  render: (instance: ComponentInstance) => string;
  bind?: (instance: ComponentInstance) => string;
}

export interface DetectedComponent {
  type: string;
  tagName: string;
  confidence: number;
  selector: string;
  properties: Record<string, unknown>;
  reasons: string[];
}

export interface ElementNode {
  tagName: string;
  attributes: Record<string, string>;
  text: string;
  children: ElementNode[];
  path: string;
}

export interface ParsedDocument {
  source: string;
  title: string;
  root: ElementNode;
  elementCount: number;
  assets: CollectedResource[];
  links: string[];
}

export type ResourceKind =
  | 'stylesheet'
  | 'script'
  | 'image'
  | 'font'
  | 'media'
  | 'other';

export interface CollectedResource {
  url: string;
  kind: ResourceKind;
  attributes: Record<string, string>;
}

export interface DOMSnapshot {
  url: string;
  html: string;
  title: string;
  capturedAt: string;
  resources: CollectedResource[];
  screenshotPath: string | null;
}

export interface TemplateNode {
  componentType: string;
  properties: Record<string, unknown>;
  children: TemplateNode[];
}

export interface TemplateDefinition {
  name: string;
  description?: string;
  root: TemplateNode;
  assets: string[];
  metadata: Record<string, unknown>;
}

export interface CompileResult {
  code: string;
  sourceMap: string | null;
  entryPoint: string;
  bytes: number;
  warnings: string[];
}

export interface BundleFile {
  path: string;
  contents: string;
  kind: 'javascript' | 'css' | 'html' | 'json' | 'asset';
}

export interface BundleManifest {
  name: string;
  format: 'esm' | 'iife';
  generatedAt: string;
  files: { path: string; kind: BundleFile['kind']; bytes: number }[];
  totalBytes: number;
}

export interface ExportManifest {
  name: string;
  generatedAt: string;
  files: { path: string; bytes: number; kind: BundleFile['kind'] }[];
  totalBytes: number;
}

export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info';
  code: string;
  message: string;
  target?: string;
}

export interface ValidationReport {
  valid: boolean;
  issues: ValidationIssue[];
}
