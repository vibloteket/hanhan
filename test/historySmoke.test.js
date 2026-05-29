import fs from 'node:fs';
import test from 'node:test';
import assert from 'node:assert/strict';

test('app routes are stored in browser history for mobile back navigation', () => {
  const source = fs.readFileSync(new URL('../src/App.js', import.meta.url), 'utf8');
  assert.match(source, /pushState\(nextState/);
  assert.match(source, /popstate/);
  assert.match(source, /mandarinModeRoute/);
});
