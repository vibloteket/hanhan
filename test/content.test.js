import test from 'node:test';
import assert from 'node:assert/strict';
import { packs, allItems, lessonItemsForRevision, lessonKey, lessonNeedsUpdate, lessonUiKeysForRevision } from '../src/content/packs.js';
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

test('lesson revisions expose only newly added content and UI keys', () => {
  const lesson = packs.flatMap((pack) => pack.lessons.map((entry) => ({ ...entry, packId: pack.id })))
    .find((entry) => entry.id === 'settings-license-contact');
  const legacyProgress = {
    completedLessons: [lessonKey(lesson.packId, lesson.id)],
    lessonMeta: { [lessonKey(lesson.packId, lesson.id)]: { revision: 1 } },
  };
  assert.equal(lessonNeedsUpdate({ completedLessons: [], lessonMeta: {} }, lesson), false, 'untouched lessons are new, not updated');
  assert.equal(lessonNeedsUpdate(legacyProgress, lesson), true);
  assert.deepEqual(lessonItemsForRevision(lesson, 1).map((item) => item.id), [
    'ui-source-char', 'ui-code-char', 'ui-code', 'ui-source-code',
  ]);
  assert.equal(lessonUiKeysForRevision(lesson, 1).includes('term.sourceCode'), false);
  assert.equal(lessonUiKeysForRevision(lesson, 2).includes('term.sourceCode'), true);
});

test('correct streak lesson follows known answer and correct components', () => {
  const lessons = packs.find((pack) => pack.id === 'app-ui-basics')?.lessons || [];
  const streakIndex = lessons.findIndex((lesson) => lesson.id === 'correct-streak');
  const answerIndex = lessons.findIndex((lesson) => lesson.id === 'answers-feedback');
  const listIndex = lessons.findIndex((lesson) => lesson.id === 'word-list-status');
  const lesson = lessons[streakIndex];

  assert.ok(answerIndex >= 0 && answerIndex < streakIndex, '答 should be taught before the streak phrase');
  assert.ok(listIndex >= 0 && listIndex < streakIndex, 'the streak lesson should follow the word-list lesson');
  assert.deepEqual(lesson.items.map((item) => item.hanzi), ['连续', '次', '连续答对 3 次']);
  assert.equal(lesson.items.at(-1).uiKey, 'status.correctStreak');
});

test('word-list UI lessons teach skill labels and status terms in order', () => {
  const lessons = packs.find((pack) => pack.id === 'app-ui-basics')?.lessons || [];
  const skillLesson = lessons.find((lesson) => lesson.id === 'meaning-hanzi-pinyin');
  const statusLesson = lessons.find((lesson) => lesson.id === 'search-card-status');

  assert.ok(skillLesson, 'skill-label lesson should exist');
  assert.deepEqual(skillLesson.items.map((item) => item.hanzi), ['意', '意思', '字', '汉字', '拼', '音', '拼音']);
  assert.deepEqual(skillLesson.unlocksUiKeys, ['term.meaning', 'term.hanzi', 'term.pinyin']);
  assert.ok(statusLesson, 'search/status lesson should exist');
  assert.ok(statusLesson.items.some((item) => item.hanzi === '搜索词表' && item.uiKey === 'action.searchWordList'));
  assert.ok(statusLesson.items.some((item) => item.hanzi === '强' && item.uiKey === 'status.strong'));
  assert.ok(statusLesson.items.some((item) => item.hanzi === '新 / 弱' && item.uiKey === 'status.newWeak'));
  assert.ok(statusLesson.items.some((item) => item.hanzi === '现在' && item.uiKey === 'status.now'));
});

test('question-card lesson teaches both prompts and multiple choice', () => {
  const lesson = packs.find((pack) => pack.id === 'app-ui-basics')?.lessons
    .find((candidate) => candidate.id === 'questions-multiple-choice');
  assert.ok(lesson, 'question-card lesson should exist');
  assert.deepEqual(lesson.unlocksUiKeys, ['exercise.multipleChoice', 'prompt.whatMeans', 'prompt.whichMeans']);
  assert.ok(lesson.items.some((item) => item.hanzi === '是什么意思？' && item.uiKey === 'prompt.whatMeans'));
  assert.ok(lesson.items.some((item) => item.hanzi === '哪个是它的意思？' && item.uiKey === 'prompt.whichMeans'));
  assert.ok(lesson.items.some((item) => item.hanzi === '选择题' && item.uiKey === 'exercise.multipleChoice'));
});

test('personal bonus teaches dream, surname Liu, and Liu Meng in order', () => {
  const lesson = packs.find((pack) => pack.id === 'personal-bonus')?.lessons
    .find((candidate) => candidate.id === 'liu-meng');
  assert.ok(lesson, 'personal bonus lesson should exist');
  assert.deepEqual(lesson.items.map((item) => item.hanzi), ['梦', '刘', '刘梦']);
  assert.equal(lesson.items[0].sv, 'dröm');
  assert.match(lesson.items[1].sv, /efternamn/);
  assert.match(lesson.items[2].notesSv, /min frus namn/);
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
