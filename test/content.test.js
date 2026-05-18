import test from 'node:test';
import assert from 'node:assert/strict';
import { packs, allItems, lessonKey } from '../src/content/packs.js';
import { uiTermByKey } from '../src/content/uiTerms.js';

test('all content items have required fields and unique IDs', () => {
  const ids = new Set();
  for (const item of allItems) {
    assert.ok(item.id, 'item id is required');
    assert.ok(item.sv, `${item.id} needs sv`);
    assert.ok(item.hanzi, `${item.id} needs hanzi`);
    assert.ok(item.pinyin, `${item.id} needs pinyin`);
    assert.equal(ids.has(item.id), false, `duplicate item id: ${item.id}`);
    ids.add(item.id);
  }
});

test('lesson keys are unique and lessons have items', () => {
  const keys = new Set();
  for (const pack of packs) {
    assert.ok(pack.id, 'pack id is required');
    for (const lesson of pack.lessons) {
      const key = lessonKey(pack.id, lesson.id);
      assert.equal(keys.has(key), false, `duplicate lesson key: ${key}`);
      assert.ok(lesson.items.length > 0, `${key} must have items`);
      keys.add(key);
    }
  }
});

test('UI content references existing UI terms', () => {
  for (const pack of packs) {
    for (const lesson of pack.lessons) {
      for (const key of lesson.unlocksUiKeys || []) {
        assert.ok(uiTermByKey[key], `${pack.id}/${lesson.id} unlocks missing ui key ${key}`);
      }
      for (const item of lesson.items) {
        if (item.uiKey) assert.ok(uiTermByKey[item.uiKey], `${item.id} references missing uiKey ${item.uiKey}`);
      }
    }
  }
});
