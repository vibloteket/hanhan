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

test('updated-lesson labels unlock through the revised continue lesson', () => {
  const legacyProgress = {
    completedLessons: ['app-ui-basics/continue-lesson'],
    lessonMeta: { 'app-ui-basics/continue-lesson': { revision: 1 } },
    settings: { uiMode: 'dynamic' },
  };
  const updatedProgress = {
    ...legacyProgress,
    lessonMeta: { 'app-ui-basics/continue-lesson': { revision: 2 } },
  };

  assert.equal(uiLabel(legacyProgress, 'action.supplement'), 'Komplettera');
  assert.equal(uiLabel(legacyProgress, 'status.newContent'), 'Nytt innehåll');
  assert.equal(uiLabel(updatedProgress, 'action.supplement'), '补充 · Komplettera');
  assert.equal(uiLabel(updatedProgress, 'status.newContent'), '新内容 · Nytt innehåll');
});

test('review completion label unlocks through the latest continue lesson revision', () => {
  const legacyProgress = {
    completedLessons: ['app-ui-basics/continue-lesson'],
    lessonMeta: { 'app-ui-basics/continue-lesson': { revision: 2 } },
    settings: { uiMode: 'dynamic' },
  };
  const updatedProgress = {
    ...legacyProgress,
    lessonMeta: { 'app-ui-basics/continue-lesson': { revision: 3 } },
  };

  assert.equal(uiLabel(legacyProgress, 'review.complete'), 'Repetition klar');
  assert.equal(uiLabel(updatedProgress, 'review.complete'), '复习完成 · Repetition klar');
});

test('dont-know label unlocks through the updated answers lesson', () => {
  const legacyProgress = {
    completedLessons: ['app-ui-basics/answers-feedback'],
    lessonMeta: { 'app-ui-basics/answers-feedback': { revision: 1 } },
    settings: { uiMode: 'dynamic' },
  };
  const updatedProgress = {
    ...legacyProgress,
    lessonMeta: { 'app-ui-basics/answers-feedback': { revision: 2 } },
  };

  assert.equal(uiLabel(legacyProgress, 'action.dontKnow'), 'jag vet inte');
  assert.equal(uiLabel(updatedProgress, 'action.dontKnow'), '我不知道 · jag vet inte');
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

test('question prompts interpolate terms before and after unlocking', () => {
  const lockedProgress = {
    completedLessons: [],
    unlockedUiKeys: [],
    settings: { uiMode: 'dynamic' },
  };
  const unlockedProgress = {
    ...lockedProgress,
    completedLessons: ['app-ui-basics/questions-multiple-choice'],
  };

  assert.equal(uiLabel(lockedProgress, 'prompt.whatMeans', { term: '习' }), 'Vad betyder 习?');
  assert.equal(uiLabel(unlockedProgress, 'prompt.whatMeans', { term: '习' }), '习 是什么意思？ · Vad betyder 习?');
  assert.equal(uiLabel(unlockedProgress, 'prompt.whichMeans', { term: 'öva' }), '哪个是“öva”的意思？ · Vilket betyder öva?');
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
