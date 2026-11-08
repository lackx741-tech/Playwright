import { describe, expect, it } from 'vitest';
import { TemplateBuilder } from '../src/templates/TemplateBuilder.js';
import { TemplateCompiler } from '../src/templates/TemplateCompiler.js';
import { TemplateRenderer } from '../src/templates/TemplateRenderer.js';
import { TemplateValidator } from '../src/templates/TemplateValidator.js';
import { TemplateRegistry } from '../src/templates/TemplateRegistry.js';
import { LayoutEngine } from '../src/templates/LayoutEngine.js';

describe('TemplateBuilder', () => {
  it('creates templates and appends components', () => {
    const builder = new TemplateBuilder();
    const template = builder.create('landing', 'container', { layout: 'flex' });
    builder.addComponent(template, 'navbar', { logo: 'Acme' });
    builder.addComponent(template, 'button', { label: 'Start' });
    expect(template.root.children).toHaveLength(2);
    expect(template.metadata['componentCount']).toBe(3);
  });

  it('nests components under an explicit parent type', () => {
    const builder = new TemplateBuilder();
    const template = builder.create('page');
    builder.addComponent(template, 'card', { title: 'Outer' });
    builder.addComponent(template, 'button', { label: 'Inner' }, 'card');
    const card = template.root.children.find((child) => child.componentType === 'card');
    expect(card?.children).toHaveLength(1);
  });
});

describe('LayoutEngine', () => {
  it('counts depth and nodes', () => {
    const builder = new TemplateBuilder();
    const template = builder.create('page');
    builder.addComponent(template, 'container');
    const engine = new LayoutEngine();
    expect(engine.count(template.root)).toBe(2);
    expect(engine.depth(template.root)).toBe(2);
  });
});

describe('TemplateCompiler', () => {
  it('renders markup and collects bindings', () => {
    const builder = new TemplateBuilder();
    const template = builder.create('page');
    builder.addComponent(template, 'button', { label: 'Click' });
    const result = new TemplateCompiler().compile(template);
    expect(result.html).toContain('Click');
    expect(result.usedComponents).toContain('button');
    expect(result.bindings.length).toBeGreaterThan(0);
  });
});

describe('TemplateRenderer', () => {
  it('produces a full html document with inline scripts', () => {
    const builder = new TemplateBuilder();
    const template = builder.create('page');
    builder.addComponent(template, 'form', { action: '/submit' });
    const document = new TemplateRenderer().renderDocument(template);
    expect(document).toContain('<!DOCTYPE html>');
    expect(document).toContain('<form');
    expect(document).toContain('<script>');
  });
});

describe('TemplateValidator', () => {
  it('rejects unknown component types', () => {
    const builder = new TemplateBuilder();
    const template = builder.create('page');
    template.root.children.push({ componentType: 'ghost', properties: {}, children: [] });
    const report = new TemplateValidator().validate(template);
    expect(report.valid).toBe(false);
    expect(report.issues.some((issue) => issue.code === 'unknown-component')).toBe(true);
  });

  it('accepts well-formed templates', () => {
    const builder = new TemplateBuilder();
    const template = builder.create('page');
    builder.addComponent(template, 'table', { columns: ['a'], rows: [{ a: 1 }] });
    expect(new TemplateValidator().validate(template).valid).toBe(true);
  });
});

describe('TemplateRegistry', () => {
  it('stores templates by name', () => {
    const builder = new TemplateBuilder();
    const registry = new TemplateRegistry();
    registry.register(builder.create('one'));
    expect(registry.list()).toHaveLength(1);
    expect(() => registry.require('missing')).toThrow();
  });
});
