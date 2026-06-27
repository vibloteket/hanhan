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

test('lessons unlock only UI terms taught by that lesson', () => {
  for (const pack of packs) {
    for (const lesson of pack.lessons) {
      const itemUiKeys = new Set(lesson.items.map((item) => item.uiKey).filter(Boolean));
      for (const key of lesson.unlocksUiKeys || []) {
        assert.ok(itemUiKeys.has(key), `${pack.id}/${lesson.id} unlocks ${key} without a matching lesson item`);
      }
    }
  }
});

test('multi-character items build on an earlier learned component', () => {
  for (const pack of packs) {
    const seenHanzi = new Set();
    for (const lesson of pack.lessons) {
      for (const item of lesson.items) {
        if (Array.from(item.hanzi).length > 1) {
          assert.ok(item.components?.length, `${item.id} (${item.hanzi}) needs components`);
          assert.ok(
            item.components.some((component) => seenHanzi.has(component.hanzi)),
            `${item.id} (${item.hanzi}) should reference at least one earlier component`
          );
        }
        seenHanzi.add(item.hanzi);
      }
    }
  }
});


test('learning meanings do not smuggle UI context into 已学', () => {
  const item = allItems.find((candidate) => candidate.id === 'ui-learned-cards');
  assert.ok(item, 'ui-learned-cards should exist');
  assert.equal(item.hanzi, '已学');
  assert.match(item.sv, /studerat|avklarat/);
  assert.doesNotMatch(item.sv, /kort/i, '已学 should not teach that “card” is part of the Chinese term');
  assert.equal(uiTermByKey['status.learnedCards'].sv, 'lärda kort', 'the Swedish UI label can remain contextual');
});
