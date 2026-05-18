import test from 'node:test';
import assert from 'node:assert/strict';
import { isCorrectHanzi, isCorrectPinyin, normalizePinyin } from '../src/textUtils.js';

test('pinyin matching accepts tone marks, no tones, numbered tones, and spaces', () => {
  const item = { pinyin: 'quèdìng' };
  assert.equal(isCorrectPinyin('quèdìng', item), true);
  assert.equal(isCorrectPinyin('queding', item), true);
  assert.equal(isCorrectPinyin('que4 ding4', item), true);
});

test('pinyin normalization handles ü and tone marks', () => {
  assert.equal(normalizePinyin('lǜ'), 'lu');
  assert.equal(normalizePinyin('xué xí'), 'xuexi');
});

test('hanzi matching ignores whitespace and punctuation', () => {
  const item = { hanzi: '显示答案' };
  assert.equal(isCorrectHanzi(' 显示答案。 ', item), true);
  assert.equal(isCorrectHanzi('显示 答案', item), true);
});
