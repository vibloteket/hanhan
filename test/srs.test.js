import test from 'node:test';
import assert from 'node:assert/strict';
import { cardId, createCard, dueCards, ensureCards, updateCard } from '../src/srs.js';

test('ensureCards creates three independent skill cards without removing existing ones', () => {
  const existing = createCard('a', 'recognize-meaning');
  const progress = ensureCards({ cards: { [cardId('a', 'recognize-meaning')]: existing } }, [{ id: 'a' }, { id: 'b' }]);
  assert.equal(progress.cards[cardId('a', 'recognize-meaning')], existing);
  assert.equal(progress.cards[cardId('a', 'recall-hanzi')].skill, 'recall-hanzi');
  assert.equal(progress.cards[cardId('a', 'recall-pinyin')].skill, 'recall-pinyin');
  assert.equal(Object.keys(progress.cards).length, 6);
});

test('dueCards filters future skill cards and exposes their exercise kinds', () => {
  const progress = {
    cards: {
      [cardId('a', 'recognize-meaning')]: { dueAt: '2026-01-01T10:00:00.000Z' },
      [cardId('a', 'recall-hanzi')]: { dueAt: '2026-01-01T09:00:00.000Z' },
      [cardId('a', 'recall-pinyin')]: { dueAt: '2099-01-01T09:00:00.000Z' },
    },
  };
  const due = dueCards(progress, [{ id: 'a' }], new Date('2026-01-01T12:00:00.000Z'));
  assert.deepEqual(due.map(({ skill, kind }) => [skill, kind]), [
    ['recall-hanzi', 'mc-sv-zh'],
    ['recognize-meaning', 'mc-zh-sv'],
  ]);
});

test('wrong answer repeats soon and resets streak', () => {
  const updated = updateCard({ itemId: 'a', skill: 'recall-pinyin', dueAt: new Date().toISOString(), intervalDays: 5, ease: 2.3, correctStreak: 2, wrongCount: 0, seenCount: 1 }, { correct: false });
  assert.equal(updated.correctStreak, 0);
  assert.equal(updated.intervalDays, 0);
  assert.equal(updated.wrongCount, 1);
  assert.ok(new Date(updated.dueAt).getTime() > Date.now());
});

test('correct retry after a wrong answer still counts as hard and repeats soon', () => {
  const base = { itemId: 'a', skill: 'recall-pinyin', dueAt: new Date().toISOString(), intervalDays: 5, ease: 2.3, correctStreak: 2, wrongCount: 0, seenCount: 1 };
  const afterWrong = updateCard(base, { correct: false, mode: 'type-pinyin' });
  const afterRetryCorrect = updateCard(afterWrong, { correct: true, hard: true, mode: 'type-pinyin' });
  assert.equal(afterRetryCorrect.correctStreak, 0);
  assert.equal(afterRetryCorrect.intervalDays, 0);
  assert.equal(afterRetryCorrect.wrongCount, 1);
  assert.equal(afterRetryCorrect.lastResult.hard, true);
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
