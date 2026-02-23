import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const root = process.cwd();

function readPackageJson() {
  return JSON.parse(readFileSync(join(root, 'package.json'), 'utf8'));
}

describe('settings schema', () => {
  test('defines all required configuration keys', () => {
    const pkg = readPackageJson();
    const properties = pkg.contributes.configuration.properties;

    expect(properties['faaahhh.enabled']).toBeDefined();
    expect(properties['faaahhh.cooldownMs']).toBeDefined();
    expect(properties['faaahhh.audioSource']).toBeDefined();
    expect(properties['faaahhh.customAudioPath']).toBeDefined();
    expect(properties['faaahhh.terminalCommandPatterns']).toBeDefined();
    expect(properties['faaahhh.dedupeWindowMs']).toBeDefined();
  });

  test('defines supported value constraints', () => {
    const pkg = readPackageJson();
    const properties = pkg.contributes.configuration.properties;

    expect(properties['faaahhh.enabled'].type).toBe('boolean');
    expect(properties['faaahhh.cooldownMs'].minimum).toBe(0);
    expect(properties['faaahhh.audioSource'].enum).toEqual(['bundled', 'custom']);
    expect(properties['faaahhh.terminalCommandPatterns'].type).toBe('array');
    expect(properties['faaahhh.dedupeWindowMs'].minimum).toBe(0);
  });
});
