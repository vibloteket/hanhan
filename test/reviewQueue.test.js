import test from 'node:test';
import assert from 'node:assert/strict';
import { answerReviewQueue, createReviewQueue, currentReviewItem, reviewProgressLabel } from '../src/reviewQueue.js';

const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
const itemById = Object.fromEntries(items.map((item) => [item.id, item]));

test('review queue contains due cards sorted by due time', () => {
  const progress = {
    cards: {
      a: { dueAt: '2026-01-01T10:00:00.000Z' },
      b: { dueAt: '2026-01-01T09:00:00.000Z' },
      c: { dueAt: '2099-01-01T09:00:00.000Z' },
    },
  };
  assert.deepEqual(createReviewQueue(progress, items), ['b', 'a']);
});

test('correct answers remove card and wrong answers requeue it at the end', () => {
  assert.deepEqual(answerReviewQueue(['a', 'b'], 'a', { correct: true }), ['b']);
  assert.deepEqual(answerReviewQueue(['a', 'b'], 'a', { correct: false }), ['b', 'a']);
});

test('current review item and progress label are deterministic', () => {
  assert.equal(currentReviewItem(['b', 'a'], itemById).id, 'b');
  assert.equal(currentReviewItem([], itemById), null);
  assert.equal(reviewProgressLabel(0, 3), '1/3');
  assert.equal(reviewProgressLabel(2, 1), '3/3');
  assert.equal(reviewProgressLabel(0, 0), '0/0');
});
