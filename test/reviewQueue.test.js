import test from 'node:test';
import assert from 'node:assert/strict';
import { answerReviewQueue, createReviewQueue, currentReviewItem, reviewProgressLabel, shuffleEntries } from '../src/reviewQueue.js';

const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
const itemById = Object.fromEntries(items.map((item) => [item.id, item]));
const noShuffle = () => 0.999;

test('review queue contains due cards sorted by due time before shuffling', () => {
  const progress = {
    cards: {
      a: { dueAt: '2026-01-01T10:00:00.000Z', seenCount: 0 },
      b: { dueAt: '2026-01-01T09:00:00.000Z', seenCount: 0 },
      c: { dueAt: '2099-01-01T09:00:00.000Z', seenCount: 0 },
    },
  };
  assert.deepEqual(createReviewQueue(progress, items, noShuffle), [
    { itemId: 'b', kind: 'mc-zh-sv', attempts: 0 },
    { itemId: 'a', kind: 'mc-zh-sv', attempts: 0 },
  ]);
});

test('review queue can shuffle due cards for a less predictable session', () => {
  const entries = [{ itemId: 'a' }, { itemId: 'b' }, { itemId: 'c' }];
  assert.deepEqual(shuffleEntries(entries, () => 0), [{ itemId: 'b' }, { itemId: 'c' }, { itemId: 'a' }]);
});

test('review queue includes pinyin entries after pinyin has been introduced', () => {
  const progress = {
    completedLessons: ['app-ui-basics/first-characters'],
    cards: {
      a: { dueAt: '2026-01-01T10:00:00.000Z', seenCount: 0 },
    },
  };
  assert.deepEqual(createReviewQueue(progress, [items[0]], noShuffle), [
    { itemId: 'a', kind: 'mc-zh-sv', attempts: 0 },
    { itemId: 'a', kind: 'type-pinyin', attempts: 0 },
  ]);
});

test('review queue separates first-round prompts from later typing prompts', () => {
  const progress = {
    completedLessons: ['app-ui-basics/first-characters'],
    cards: {
      a: { dueAt: '2026-01-01T09:00:00.000Z', seenCount: 0 },
      b: { dueAt: '2026-01-01T10:00:00.000Z', seenCount: 0 },
    },
  };
  assert.deepEqual(createReviewQueue(progress, [items[0], items[1]], noShuffle), [
    { itemId: 'a', kind: 'mc-zh-sv', attempts: 0 },
    { itemId: 'b', kind: 'mc-zh-sv', attempts: 0 },
    { itemId: 'a', kind: 'type-pinyin', attempts: 0 },
    { itemId: 'b', kind: 'type-pinyin', attempts: 0 },
  ]);
});

test('correct answers remove entry and first wrong answer gives an immediate retry', () => {
  const queue = [{ itemId: 'a', kind: 'type-pinyin', attempts: 0 }, { itemId: 'b', kind: 'mc-zh-sv', attempts: 0 }];
  assert.deepEqual(answerReviewQueue(queue, { correct: true }), [{ itemId: 'b', kind: 'mc-zh-sv', attempts: 0 }]);
  assert.deepEqual(answerReviewQueue(queue, { correct: false }), [{ itemId: 'a', kind: 'type-pinyin', attempts: 1 }, { itemId: 'b', kind: 'mc-zh-sv', attempts: 0 }]);
});

test('second wrong answer drops entry from the current session', () => {
  const queue = [{ itemId: 'a', kind: 'type-pinyin', attempts: 1 }, { itemId: 'b', kind: 'mc-zh-sv', attempts: 0 }];
  assert.deepEqual(answerReviewQueue(queue, { correct: false }), [{ itemId: 'b', kind: 'mc-zh-sv', attempts: 0 }]);
});

test('current review item and progress label are deterministic', () => {
  assert.equal(currentReviewItem([{ itemId: 'b', kind: 'mc-zh-sv' }, { itemId: 'a', kind: 'mc-zh-sv' }], itemById).id, 'b');
  assert.equal(currentReviewItem([], itemById), null);
  assert.equal(reviewProgressLabel(0, 3), '1/3');
  assert.equal(reviewProgressLabel(2, 1), '3/3');
  assert.equal(reviewProgressLabel(0, 0), '0/0');
});
