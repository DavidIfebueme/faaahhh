import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const root = process.cwd();

function readJson(path: string): any {
  return JSON.parse(readFileSync(join(root, path), 'utf8'));
}

describe('extension scaffold', () => {
  test('defines vscode engine and startup activation', () => {
    const pkg = readJson('package.json');
    expect(pkg.engines.vscode).toBeTypeOf('string');
    expect(pkg.activationEvents).toContain('onStartupFinished');
  });

  test('includes extension entry point and packaged media', () => {
    const pkg = readJson('package.json');
    const ignore = readFileSync(join(root, '.vscodeignore'), 'utf8');
    expect(pkg.main).toBe('./dist/extension.js');
    expect(pkg.files).toContain('media');
    expect(ignore.includes('src/**')).toBe(true);
  });
});
