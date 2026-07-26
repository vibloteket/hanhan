import test from 'node:test';
import assert from 'node:assert/strict';
import { isUnlocked, isMasteredUiKey, uiLabel, unlockedUiKeysFor } from '../src/uiText.js';

test('UI labels unlock from completed lessons even if stored unlockedUiKeys is stale', () => {
  const progress = {
    completedLessons: ['app-ui-basics/start-button'],
    unlockedUiKeys: [],
    settings: { uiMode: 'dynamic' },
  };

  assert.equal(isUnlocked(progress, 'action.start'), true);
  assert.equal(uiLabel(progress, 'action.start'), '开始 · Starta');
  assert.equal(isUnlocked(progress, 'action.review'), false);
  assert.equal(uiLabel(progress, 'action.review'), 'Repetera');
});

test('dynamic UI labels become Chinese-only when the backing card is mastered', () => {
  const progress = {
    completedLessons: ['app-ui-basics/start-button'],
    unlockedUiKeys: [],
    settings: { uiMode: 'dynamic' },
    cards: {
      'ui-start/recognize-meaning': { correctStreak: 4 },
    },
  };

  assert.equal(isMasteredUiKey(progress, 'action.start'), true);
  assert.equal(uiLabel(progress, 'action.start'), '开始');
});

test('dynamic UI labels restore Swedish support when mastery streak drops', () => {
  const progress = {
    completedLessons: ['app-ui-basics/start-button'],
    unlockedUiKeys: [],
    settings: { uiMode: 'dynamic' },
    cards: {
      'ui-start/recognize-meaning': { correctStreak: 3 },
    },
  };

  assert.equal(isMasteredUiKey(progress, 'action.start'), false);
  assert.equal(uiLabel(progress, 'action.start'), '开始 · Starta');
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

test('debug Chinese UI mode shows locked labels in Chinese too', () => {
  const progress = {
    completedLessons: [],
    unlockedUiKeys: [],
    settings: { uiMode: 'zh-all' },
  };

  assert.equal(isUnlocked(progress, 'action.review'), false);
  assert.equal(uiLabel(progress, 'action.review'), '复习');
});

test('UI labels interpolate dynamic values before and after unlocking', () => {
  const lockedProgress = {
    completedLessons: [],
    unlockedUiKeys: [],
    settings: { uiMode: 'dynamic' },
  };
  const unlockedProgress = {
    ...lockedProgress,
    completedLessons: ['app-ui-basics/correct-streak'],
  };

  assert.equal(uiLabel(lockedProgress, 'status.correctStreak', { count: 3 }), '3 rätt i rad');
  assert.equal(uiLabel(unlockedProgress, 'status.correctStreak', { count: 3 }), '连续答对 3 次 · 3 rätt i rad');
});
