import test from 'node:test';
import assert from 'node:assert/strict';
import { formatUiDate, usesChineseDateFormat } from '../src/dateFormat.js';

const value = new Date(2026, 5, 4, 7, 8).toISOString();

test('UI dates remain Swedish before the date lesson', () => {
  const progress = { completedLessons: [], settings: { uiMode: 'dynamic' } };
  assert.equal(usesChineseDateFormat(progress), false);
  assert.match(formatUiDate(value, progress, { includeTime: true }), /^4 juni 07:08$/);
});

test('UI dates use month and day markers after the date lesson', () => {
  const progress = { completedLessons: ['app-ui-basics/dates-in-ui'], settings: { uiMode: 'dynamic' } };
  assert.equal(usesChineseDateFormat(progress), true);
  assert.equal(formatUiDate(value, progress, { includeTime: true }), '6月4日 07:08');
});

test('word-list dates retain digital time for today', () => {
  const progress = { completedLessons: ['app-ui-basics/dates-in-ui'] };
  const now = new Date(2026, 5, 4, 6, 0);
  const due = new Date(2026, 5, 4, 7, 8);
  assert.equal(formatUiDate(due, progress, { timeOnlyToday: true, now }), '07:08');
});
