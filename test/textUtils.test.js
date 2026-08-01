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

test('pinyin matching supports item-specific alternatives containing digits', () => {
  const item = {
    pinyin: 'liánxù dáduì sān cì',
    acceptedPinyin: ['liánxù dáduì 3 cì'],
  };
  assert.equal(isCorrectPinyin('liánxù dáduì 3 cì', item), true);
  assert.equal(isCorrectPinyin('lianxu dadui 3 ci', item), true);
  assert.equal(isCorrectPinyin('lian2 xu4 da2 dui4 3 ci4', item), true);
  assert.equal(isCorrectPinyin('lianxu dadui ci', item), false);
  assert.equal(isCorrectPinyin('lianxu dadui 4 ci', item), false);
});

test('hanzi matching ignores whitespace and punctuation', () => {
  const item = { hanzi: '显示答案' };
  assert.equal(isCorrectHanzi(' 显示答案。 ', item), true);
  assert.equal(isCorrectHanzi('显示 答案', item), true);
});
