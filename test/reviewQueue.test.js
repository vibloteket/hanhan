import test from 'node:test';
import assert from 'node:assert/strict';
import { answerReviewQueue, createReviewQueue, currentReviewItem, reviewProgressLabel } from '../src/reviewQueue.js';

const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
const itemById = Object.fromEntries(items.map((item) => [item.id, item]));

test('review queue contains due cards sorted by due time', () => {
  const progress = {
    cards: {
      a: { dueAt: '2026-01-01T10:00:00.000Z', seenCount: 0 },
      b: { dueAt: '2026-01-01T09:00:00.000Z', seenCount: 0 },
      c: { dueAt: '2099-01-01T09:00:00.000Z', seenCount: 0 },
    },
  };
  assert.deepEqual(createReviewQueue(progress, items), [
    { itemId: 'b', kind: 'mc-zh-sv' },
    { itemId: 'a', kind: 'mc-zh-sv' },
  ]);
});

test('review queue includes pinyin entries after pinyin has been introduced', () => {
  const progress = {
    completedLessons: ['app-ui-basics/first-characters'],
    cards: {
      a: { dueAt: '2026-01-01T10:00:00.000Z', seenCount: 0 },
    },
  };
  assert.deepEqual(createReviewQueue(progress, [items[0]]), [
    { itemId: 'a', kind: 'mc-zh-sv' },
    { itemId: 'a', kind: 'type-pinyin' },
  ]);
});

test('correct answers remove entry and wrong answers requeue that entry at the end', () => {
  const queue = [{ itemId: 'a', kind: 'type-pinyin' }, { itemId: 'b', kind: 'mc-zh-sv' }];
  assert.deepEqual(answerReviewQueue(queue, { correct: true }), [{ itemId: 'b', kind: 'mc-zh-sv' }]);
  assert.deepEqual(answerReviewQueue(queue, { correct: false }), [{ itemId: 'b', kind: 'mc-zh-sv' }, { itemId: 'a', kind: 'type-pinyin' }]);
});

test('current review item and progress label are deterministic', () => {
  assert.equal(currentReviewItem([{ itemId: 'b', kind: 'mc-zh-sv' }, { itemId: 'a', kind: 'mc-zh-sv' }], itemById).id, 'b');
  assert.equal(currentReviewItem([], itemById), null);
  assert.equal(reviewProgressLabel(0, 3), '1/3');
  assert.equal(reviewProgressLabel(2, 1), '3/3');
  assert.equal(reviewProgressLabel(0, 0), '0/0');
});
