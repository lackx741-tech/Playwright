import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { ComponentRegistry } from '../src/components/ComponentRegistry.js';
import { ComponentDetector } from '../src/components/ComponentDetector.js';
import { ComponentValidator } from '../src/components/ComponentValidator.js';
import { ComponentFactory } from '../src/components/ComponentFactory.js';
import { ComponentSerializer } from '../src/components/ComponentSerializer.js';
import { HTMLParser } from '../src/cheerio/HTMLParser.js';

const html = readFileSync(new URL('./fixtures/sample.html', import.meta.url), 'utf8');

describe('ComponentRegistry', () => {
  it('registers the built-in component catalog', () => {
    const registry = new ComponentRegistry();
    const types = registry.list().map((definition) => definition.schema.type).sort();
    expect(types).toEqual(['button', 'card', 'container', 'form', 'modal', 'navbar', 'table']);
  });

  it('creates instances with schema defaults merged', () => {
    const registry = new ComponentRegistry();
    const instance = registry.create('button', { label: 'Go' });
    expect(instance.properties['label']).toBe('Go');
    expect(instance.properties['color']).toBe('primary');
    expect(instance.id).toMatch(/^button-/);
  });

  it('renders button markup', () => {
    const registry = new ComponentRegistry();
    const definition = registry.require('button');
    const instance = registry.create('button', { label: 'Buy', href: '/buy' });
    const markup = definition.render(instance);
    expect(markup).toContain('href="/buy"');
    expect(markup).toContain('Buy');
  });

  it('supports unregistering', () => {
    const registry = new ComponentRegistry();
    expect(registry.unregister('modal')).toBe(true);
    expect(registry.has('modal')).toBe(false);
  });
});

describe('ComponentDetector', () => {
  it('detects common UI patterns', () => {
    const parser = new HTMLParser();
    const detected = new ComponentDetector().detect(parser.parse(html));
    const types = new Set(detected.map((item) => item.type));
    expect(types.has('button')).toBe(true);
    expect(types.has('navbar')).toBe(true);
    expect(types.has('card')).toBe(true);
    expect(types.has('form')).toBe(true);
    expect(types.has('table')).toBe(true);
    for (const item of detected) expect(item.confidence).toBeGreaterThan(0);
  });
});

describe('ComponentFactory', () => {
  it('converts detections into registry instances', () => {
    const parser = new HTMLParser();
    const detected = new ComponentDetector().detect(parser.parse(html));
    const instances = new ComponentFactory().fromDetected(detected);
    expect(instances.length).toBeGreaterThan(0);
    expect(instances.every((instance) => instance.type.length > 0)).toBe(true);
  });
});

describe('ComponentValidator', () => {
  it('flags missing required properties', () => {
    const registry = new ComponentRegistry();
    const validator = new ComponentValidator(registry);
    const report = validator.validateInstance({ id: 'x', type: 'button', properties: { label: '' }, children: [] });
    expect(report.valid).toBe(false);
    expect(report.issues.some((issue) => issue.code === 'missing-property')).toBe(true);
  });

  it('accepts valid instances', () => {
    const registry = new ComponentRegistry();
    const validator = new ComponentValidator(registry);
    const instance = registry.create('card', { title: 'Hello' });
    expect(validator.validateInstance(instance).valid).toBe(true);
  });

  it('reports unknown component types', () => {
    const registry = new ComponentRegistry();
    const report = new ComponentValidator(registry).validateInstance({ id: 'x', type: 'nope', properties: {}, children: [] });
    expect(report.issues[0]?.code).toBe('unknown-component');
  });
});

describe('ComponentSerializer', () => {
  it('round-trips instances', () => {
    const registry = new ComponentRegistry();
    const serializer = new ComponentSerializer();
    const instance = registry.create('button', { label: 'Round trip' });
    const json = serializer.serializeInstance(instance);
    expect(serializer.deserializeInstance(json).properties['label']).toBe('Round trip');
  });
});
