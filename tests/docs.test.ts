import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

describe('documentation', () => {
  test('includes README and changelog with key sections', () => {
    const root = process.cwd();
    const readme = readFileSync(join(root, 'README.md'), 'utf8');
    const changelog = readFileSync(join(root, 'CHANGELOG.md'), 'utf8');

    expect(readme.includes('# Faaahhh')).toBe(true);
    expect(readme.includes('## Configuration')).toBe(true);
    expect(readme.includes('faaahhh.testSound')).toBe(true);
    expect(changelog.includes('## 0.0.1')).toBe(true);
  });
});
