import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';
import { allItems } from '../src/content/packs.js';

function readSourceFiles(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...readSourceFiles(fullPath));
    else if (entry.isFile() && entry.name.endsWith('.js')) files.push(fs.readFileSync(fullPath, 'utf8'));
  }
  return files;
}

test('taught UI keys are referenced by app UI code', () => {
  const source = readSourceFiles(fileURLToPath(new URL('../src', import.meta.url))).join('\n');
  const taughtUiKeys = new Set(allItems.map((item) => item.uiKey).filter(Boolean));

  for (const key of taughtUiKeys) {
    assert.ok(source.includes(`"${key}"`) || source.includes(`'${key}'`), `${key} is taught but not referenced by UI code`);
  }
});
