import test from 'node:test';
import assert from 'node:assert/strict';
import { lessonSteps, reviewKindFor, reviewKindsFor, unlockedExerciseTypesFor } from '../src/exercises.js';

test('normal lessons are recognition-first by default', () => {
  const lesson = { items: [{ id: 'a' }, { id: 'b' }] };
  assert.deepEqual(lessonSteps(lesson).map((step) => step.kind), [
    'intro', 'mc-zh-sv', 'mc-sv-zh',
    'intro', 'mc-zh-sv', 'mc-sv-zh',
  ]);
});

test('lessons can explicitly introduce typing practice', () => {
  const lesson = { practiceModes: ['type-pinyin'], unlocksExerciseTypes: ['type-pinyin'], items: [{ id: 'a' }] };
  assert.deepEqual(lessonSteps(lesson).map((step) => step.kind), [
    'intro', 'mc-zh-sv', 'mc-sv-zh', 'type-pinyin',
  ]);
});

test('lessons only use already introduced practice modes', () => {
  const lesson = { practiceModes: ['type-pinyin'], items: [{ id: 'a' }] };
  assert.deepEqual(lessonSteps(lesson).map((step) => step.kind), ['intro', 'mc-zh-sv', 'mc-sv-zh']);
  assert.deepEqual(lessonSteps(lesson, { unlockedExerciseTypes: ['type-pinyin'] }).map((step) => step.kind), [
    'intro', 'mc-zh-sv', 'mc-sv-zh', 'type-pinyin',
  ]);
});

test('review does not use typing before exercise type is unlocked', () => {
  const card = { seenCount: 3, correctStreak: 3 };
  assert.equal(reviewKindFor(card, { unlockedExerciseTypes: [] }), 'mc-sv-zh');
});

test('review uses pinyin and hanzi typing only after each type is unlocked', () => {
  assert.deepEqual(reviewKindsFor({ seenCount: 2, correctStreak: 1 }, { unlockedExerciseTypes: ['type-pinyin'] }), ['mc-zh-sv', 'type-pinyin']);
  assert.equal(reviewKindFor({ seenCount: 4, correctStreak: 3 }, { unlockedExerciseTypes: ['type-pinyin'] }), 'type-pinyin');
  assert.equal(reviewKindFor({ seenCount: 4, correctStreak: 3 }, { unlockedExerciseTypes: ['type-pinyin', 'type-hanzi'] }), 'type-hanzi');
});

test('completed lessons also count as unlocked exercise types for older local data', () => {
  const unlocked = unlockedExerciseTypesFor({ completedLessons: ['app-ui-basics/first-characters'], unlockedExerciseTypes: [] });
  assert.equal(unlocked.has('type-pinyin'), true);
});
