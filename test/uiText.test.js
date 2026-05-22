import test from 'node:test';
import assert from 'node:assert/strict';
import { isUnlocked, uiLabel, unlockedUiKeysFor } from '../src/uiText.js';

test('UI labels unlock from completed lessons even if stored unlockedUiKeys is stale', () => {
  const progress = {
    completedLessons: ['app-ui-basics/navigation'],
    unlockedUiKeys: [],
    settings: { uiMode: 'gradual-assisted' },
  };

  assert.equal(isUnlocked(progress, 'action.start'), true);
  assert.equal(uiLabel(progress, 'action.start'), '开始 · Starta');
  assert.equal(isUnlocked(progress, 'action.review'), false);
  assert.equal(uiLabel(progress, 'action.review'), 'Repetera');
});

test('unlockedUiKeysFor combines persisted and completed-lesson unlocks', () => {
  const keys = unlockedUiKeysFor({
    completedLessons: ['app-ui-basics/first-characters'],
    unlockedUiKeys: ['action.review'],
  });

  assert.equal(keys.has('term.word'), true);
  assert.equal(keys.has('feedback.correct'), true);
  assert.equal(keys.has('action.review'), true);
});
