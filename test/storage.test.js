import test from 'node:test';
import assert from 'node:assert/strict';
import { BACKUP_APP_ID, createDefaultProgress, makeBackup, normalizeProgress, parseBackup } from '../src/storage.js';

test('normalizeProgress fills missing newer fields', () => {
  const normalized = normalizeProgress({ schemaVersion: 1, completedLessons: ['a/b'] });
  assert.deepEqual(normalized.completedLessons, ['a/b']);
  assert.deepEqual(normalized.lessonMeta, {});
  assert.deepEqual(normalized.unlockedExerciseTypes, []);
  assert.equal(normalized.activeSession, null);
  assert.equal(normalized.settings.uiMode, 'dynamic');
});

test('normalizeProgress migrates legacy gradual UI modes to dynamic', () => {
  const assisted = normalizeProgress({ schemaVersion: 1, settings: { uiMode: 'gradual-assisted' } });
  const hints = normalizeProgress({ schemaVersion: 1, settings: { uiMode: 'gradual-hints' } });
  assert.equal(assisted.settings.uiMode, 'dynamic');
  assert.equal(hints.settings.uiMode, 'dynamic');
});

test('normalizeProgress preserves supported debug UI mode and rejects unknown modes', () => {
  const debug = normalizeProgress({ schemaVersion: 1, settings: { uiMode: 'zh-all' } });
  const unknown = normalizeProgress({ schemaVersion: 1, settings: { uiMode: 'emoji' } });
  assert.equal(debug.settings.uiMode, 'zh-all');
  assert.equal(unknown.settings.uiMode, 'dynamic');
});

test('normalizeProgress discards legacy generic cards and keeps skill cards', () => {
  const normalized = normalizeProgress({ schemaVersion: 1, cards: {
    legacy: { itemId: 'legacy', dueAt: '2026-01-01T00:00:00Z' },
    'known/recall-pinyin': { itemId: 'known', skill: 'recall-pinyin', dueAt: '2026-01-01T00:00:00Z' },
  } });
  assert.deepEqual(Object.keys(normalized.cards), ['known/recall-pinyin']);
});

test('normalizeProgress rejects unsupported schemas', () => {
  assert.deepEqual(normalizeProgress({ schemaVersion: 999 }).completedLessons, []);
});

test('backup roundtrip validates app id and preserves progress', () => {
  const progress = { ...createDefaultProgress(), completedLessons: ['pack/lesson'], lessonMeta: { 'pack/lesson': { completedAt: '2026-01-01T00:00:00.000Z' } } };
  const backup = makeBackup(progress);
  assert.equal(backup.app, BACKUP_APP_ID);
  const parsed = parseBackup(JSON.stringify(backup));
  assert.deepEqual(parsed.completedLessons, ['pack/lesson']);
  assert.equal(parsed.lessonMeta['pack/lesson'].completedAt, '2026-01-01T00:00:00.000Z');
  assert.throws(() => parseBackup(JSON.stringify({ app: 'other', progress })), /backup/);
});
