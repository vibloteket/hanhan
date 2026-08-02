import test from 'node:test';
import assert from 'node:assert/strict';
import { knowledgeScore, sortWordList } from '../src/wordList.js';

function entry(id, cards, extra = {}) {
  return {
    item: { id, packId: 'pack', lessonId: extra.lessonId || id, hanzi: extra.hanzi || id, pinyin: extra.pinyin || id, sv: extra.sv || id },
    skills: cards.map((card) => ({ card })),
  };
}

test('recent review puts the most recently answered word first and unanswered words last', () => {
  const old = entry('old', [{ lastReviewedAt: '2026-08-01T10:00:00.000Z' }]);
  const recent = entry('recent', [{ lastReviewedAt: '2026-08-02T10:00:00.000Z' }]);
  const never = entry('never', [{}]);
  assert.deepEqual(sortWordList([old, never, recent], 'recent-review', {}).map(({ item }) => item.id), ['recent', 'old', 'never']);
});

test('hardest and strongest use opposite knowledge ordering', () => {
  const hard = entry('hard', [{ seenCount: 5, wrongCount: 4, correctStreak: 0, intervalDays: 0, ease: 1.3 }]);
  const strong = entry('strong', [{ seenCount: 5, wrongCount: 0, correctStreak: 4, intervalDays: 12, ease: 2.7 }]);
  assert.ok(knowledgeScore(strong) > knowledgeScore(hard));
  assert.deepEqual(sortWordList([strong, hard], 'hardest', {}).map(({ item }) => item.id), ['hard', 'strong']);
  assert.deepEqual(sortWordList([hard, strong], 'strongest', {}).map(({ item }) => item.id), ['strong', 'hard']);
});

test('recent learned uses lesson completion time', () => {
  const first = entry('first', [{}], { lessonId: 'first' });
  const last = entry('last', [{}], { lessonId: 'last' });
  const progress = { lessonMeta: {
    'pack/first': { completedAt: '2026-08-01T10:00:00.000Z' },
    'pack/last': { completedAt: '2026-08-02T10:00:00.000Z' },
  } };
  assert.deepEqual(sortWordList([first, last], 'recent-learned', progress).map(({ item }) => item.id), ['last', 'first']);
});

test('alphabetical sorts support pinyin and Swedish text', () => {
  const a = entry('a', [{}], { pinyin: 'zài', sv: 'äpple' });
  const b = entry('b', [{}], { pinyin: 'ài', sv: 'banan' });
  assert.deepEqual(sortWordList([a, b], 'pinyin', {}).map(({ item }) => item.id), ['b', 'a']);
  assert.deepEqual(sortWordList([a, b], 'swedish', {}).map(({ item }) => item.id), ['b', 'a']);
});
