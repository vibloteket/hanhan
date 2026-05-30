import test from 'node:test';
import assert from 'node:assert/strict';
import { createCard, dueCards, ensureCards, updateCard } from '../src/srs.js';

test('ensureCards creates missing cards without removing existing ones', () => {
  const existing = createCard('a');
  const progress = ensureCards({ cards: { a: existing } }, [{ id: 'a' }, { id: 'b' }]);
  assert.equal(progress.cards.a, existing);
  assert.equal(progress.cards.b.itemId, 'b');
});

test('dueCards filters future cards and sorts due cards', () => {
  const progress = {
    cards: {
      a: { dueAt: '2026-01-01T10:00:00.000Z' },
      b: { dueAt: '2026-01-01T09:00:00.000Z' },
      c: { dueAt: '2099-01-01T09:00:00.000Z' },
    },
  };
  const due = dueCards(progress, [{ id: 'a' }, { id: 'b' }, { id: 'c' }], new Date('2026-01-01T12:00:00.000Z'));
  assert.deepEqual(due.map(({ item }) => item.id), ['b', 'a']);
});

test('wrong answer repeats soon and resets streak', () => {
  const updated = updateCard({ itemId: 'a', dueAt: new Date().toISOString(), intervalDays: 5, ease: 2.3, correctStreak: 2, wrongCount: 0, seenCount: 1 }, { correct: false });
  assert.equal(updated.correctStreak, 0);
  assert.equal(updated.intervalDays, 0);
  assert.equal(updated.wrongCount, 1);
  assert.ok(new Date(updated.dueAt).getTime() > Date.now());
});

test('correct retry after a wrong answer still counts as hard and repeats soon', () => {
  const base = { itemId: 'a', dueAt: new Date().toISOString(), intervalDays: 5, ease: 2.3, correctStreak: 2, wrongCount: 0, seenCount: 1 };
  const afterWrong = updateCard(base, { correct: false, mode: 'type-pinyin' });
  const afterRetryCorrect = updateCard(afterWrong, { correct: true, hard: true, mode: 'type-pinyin' });

  assert.equal(afterRetryCorrect.correctStreak, 0);
  assert.equal(afterRetryCorrect.intervalDays, 0);
  assert.equal(afterRetryCorrect.wrongCount, 1);
  assert.equal(afterRetryCorrect.lastResult.hard, true);
  assert.ok(new Date(afterRetryCorrect.dueAt).getTime() > Date.now());
  assert.ok(new Date(afterRetryCorrect.dueAt).getTime() < Date.now() + 30 * 60 * 1000);
});

test('typed answers receive more scheduling credit than multiple choice', () => {
  const base = { itemId: 'a', dueAt: new Date().toISOString(), intervalDays: 1, ease: 2.3, correctStreak: 1, wrongCount: 0, seenCount: 1 };
  const mc = updateCard(base, { correct: true, mode: 'multiple-choice' });
  const pinyin = updateCard(base, { correct: true, mode: 'type-pinyin' });
  const hanzi = updateCard(base, { correct: true, mode: 'type-hanzi' });
  assert.ok(pinyin.intervalDays > mc.intervalDays);
  assert.ok(hanzi.intervalDays > pinyin.intervalDays);
});
