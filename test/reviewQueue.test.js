import test from 'node:test';
import assert from 'node:assert/strict';
import { answerReviewQueue, createReviewQueue, currentReviewItem, reviewProgressLabel, shuffleEntries } from '../src/reviewQueue.js';
import { cardId } from '../src/srs.js';

const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }];
const itemById = Object.fromEntries(items.map((item) => [item.id, item]));
const noShuffle = () => 0.999;

function card(itemId, skill, dueAt) {
  return { itemId, skill, dueAt, seenCount: 0 };
}

test('review queue creates one entry per due skill card', () => {
  const progress = { cards: {
    [cardId('a', 'recognize-meaning')]: card('a', 'recognize-meaning', '2026-01-01T10:00:00.000Z'),
    [cardId('a', 'recall-hanzi')]: card('a', 'recall-hanzi', '2026-01-01T09:00:00.000Z'),
    [cardId('a', 'recall-pinyin')]: card('a', 'recall-pinyin', '2026-01-01T08:00:00.000Z'),
  } };
  assert.deepEqual(createReviewQueue(progress, [items[0]], noShuffle), [
    { cardId: cardId('a', 'recall-pinyin'), itemId: 'a', skill: 'recall-pinyin', kind: 'type-pinyin', attempts: 0 },
    { cardId: cardId('a', 'recall-hanzi'), itemId: 'a', skill: 'recall-hanzi', kind: 'mc-sv-zh', attempts: 0 },
    { cardId: cardId('a', 'recognize-meaning'), itemId: 'a', skill: 'recognize-meaning', kind: 'mc-zh-sv', attempts: 0 },
  ]);
});

test('review queue excludes future skill cards', () => {
  const progress = { cards: {
    [cardId('a', 'recognize-meaning')]: card('a', 'recognize-meaning', '2099-01-01T10:00:00.000Z'),
  } };
  assert.deepEqual(createReviewQueue(progress, [items[0]], noShuffle), []);
});

test('review queue can shuffle entries', () => {
  const entries = [{ itemId: 'a' }, { itemId: 'b' }, { itemId: 'c' }];
  assert.deepEqual(shuffleEntries(entries, () => 0), [{ itemId: 'b' }, { itemId: 'c' }, { itemId: 'a' }]);
});

test('correct answers remove entry and first wrong answer gives an immediate retry', () => {
  const queue = [{ cardId: 'a/recall-pinyin', itemId: 'a', kind: 'type-pinyin', attempts: 0 }, { cardId: 'b/recognize-meaning', itemId: 'b', kind: 'mc-zh-sv', attempts: 0 }];
  assert.deepEqual(answerReviewQueue(queue, { correct: true }), [queue[1]]);
  assert.deepEqual(answerReviewQueue(queue, { correct: false }), [{ ...queue[0], attempts: 1 }, queue[1]]);
});

test('second wrong answer drops entry from the current session', () => {
  const queue = [{ itemId: 'a', kind: 'type-pinyin', attempts: 1 }, { itemId: 'b', kind: 'mc-zh-sv', attempts: 0 }];
  assert.deepEqual(answerReviewQueue(queue, { correct: false }), [queue[1]]);
});

test('current review item and progress label are deterministic', () => {
  assert.equal(currentReviewItem([{ itemId: 'b' }, { itemId: 'a' }], itemById).id, 'b');
  assert.equal(currentReviewItem([], itemById), null);
  assert.equal(reviewProgressLabel(0, 3), '1/3');
  assert.equal(reviewProgressLabel(2, 1), '3/3');
  assert.equal(reviewProgressLabel(0, 0), '0/0');
});
