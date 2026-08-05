import test from 'node:test';
import assert from 'node:assert/strict';
import { lessonSteps, pickChoices, reviewKindFor, reviewKindsFor, scoreDistractor, unlockedExerciseTypesFor } from '../src/exercises.js';

test('normal lessons are recognition-first by default', () => {
  const lesson = { items: [{ id: 'a' }, { id: 'b' }] };
  assert.deepEqual(lessonSteps(lesson).map((step) => step.kind), [
    'intro', 'mc-zh-sv', 'mc-sv-zh',
    'intro', 'mc-zh-sv', 'mc-sv-zh',
  ]);
});

test('lessons can explicitly introduce typing practice', () => {
  const lesson = { practiceModes: ['type-pinyin'], unlocksExerciseTypes: ['type-pinyin'], items: [{ id: 'a' }] };
  assert.deepEqual(lessonSteps(lesson).map((step) => step.kind), [
    'intro', 'mc-zh-sv', 'mc-sv-zh', 'type-pinyin',
  ]);
});

test('lessons only use already introduced practice modes', () => {
  const lesson = { practiceModes: ['type-pinyin'], items: [{ id: 'a' }] };
  assert.deepEqual(lessonSteps(lesson).map((step) => step.kind), ['intro', 'mc-zh-sv', 'mc-sv-zh']);
  assert.deepEqual(lessonSteps(lesson, { unlockedExerciseTypes: ['type-pinyin'] }).map((step) => step.kind), [
    'intro', 'mc-zh-sv', 'mc-sv-zh', 'type-pinyin',
  ]);
});

test('multiple-choice options do not repeat the same label', () => {
  const item = { id: 'ui-language-char', sv: 'språk', hanzi: '语', pinyin: 'yǔ' };
  const choices = pickChoices(item, 'sv');
  assert.equal(choices.filter((choice) => choice.label === 'språk').length, 1);
  assert.equal(new Set(choices.map((choice) => choice.label)).size, choices.length);
});

test('Swedish multiple-choice options exclude overlapping meanings', () => {
  const item = { id: 'ui-practice-study-char', sv: 'öva / studera', hanzi: '习', pinyin: 'xí' };
  const choices = pickChoices(item, 'sv');
  assert.equal(choices.some((choice) => choice.label === 'öva'), false);
  assert.equal(choices.some((choice) => choice.label === 'lära / studera'), false);
  assert.equal(choices.filter((choice) => choice.label === 'öva / studera').length, 1);
  assert.equal(choices.length, 4);
});

test('Swedish choices do not repeat imperative and infinitive forms', () => {
  const item = { id: 'ui-not-yet-char', sv: 'inte ännu', hanzi: '未', pinyin: 'wèi' };
  const labels = pickChoices(item, 'sv').map((choice) => choice.label);
  assert.equal(labels.includes('fortsätt') && labels.includes('fortsätta'), false);
  assert.equal(labels.length, 4);
});

test('Swedish choices exclude another contextual meaning of the same Chinese expression', () => {
  const item = { id: 'ui-review', sv: 'repetera', hanzi: '复习', pinyin: 'fùxí' };
  const choices = pickChoices(item, 'sv');
  assert.equal(choices.some((choice) => choice.label === 'repetition'), false);
  assert.equal(choices.filter((choice) => choice.label === 'repetera').length, 1);
  assert.equal(choices.length, 4);
});

test('Swedish choices do not use a compound and its explicit component as distractors', () => {
  const component = { id: 'ui-complete-char1', sv: 'färdig / komplett', hanzi: '完', pinyin: 'wán' };
  const componentChoices = pickChoices(component, 'sv');
  assert.equal(componentChoices.some((choice) => choice.label === 'klar / slutförd'), false);
  assert.equal(componentChoices.length, 4);

  const compound = {
    id: 'ui-complete',
    sv: 'klar / slutförd',
    hanzi: '完成',
    pinyin: 'wánchéng',
    components: [{ hanzi: '完', pinyin: 'wán', sv: 'färdig / komplett' }],
  };
  const compoundChoices = pickChoices(compound, 'sv');
  assert.equal(compoundChoices.some((choice) => choice.label === 'färdig / komplett'), false);
  assert.equal(compoundChoices.length, 4);
});

test('multiple-choice options do not include a distractor with the correct label', () => {
  const item = { id: 'action-review-copy', sv: 'repetition', hanzi: '复习', pinyin: 'fùxí' };
  const choices = pickChoices(item, 'hanzi');
  assert.equal(choices.filter((choice) => choice.label === '复习').length, 1);
  assert.equal(new Set(choices.map((choice) => choice.label)).size, choices.length);
});

test('Chinese distractors strongly prefer the same character length', () => {
  const item = { id: 'ui-review', sv: 'repetera', hanzi: '复习', pinyin: 'fùxí', packId: 'app-ui-basics', lessonId: 'review-actions' };
  const choices = pickChoices(item, 'hanzi');
  assert.equal(choices.length, 4);
  assert.equal(choices.filter((choice) => Array.from(choice.label).length === 2).length, 4);
});

test('lesson distractor exclusions prevent both directions of an ambiguous pair', () => {
  const startLessonItems = ['ui-open', 'ui-begin-char'].map((id) =>
    pickChoices({
      id,
      hanzi: id === 'ui-open' ? '开' : '始',
      distractorExclusions: [['ui-open', 'ui-begin-char']],
    }, 'hanzi').map((choice) => choice.label)
  );

  assert.equal(startLessonItems[0].includes('始'), false);
  assert.equal(startLessonItems[1].includes('开'), false);
  assert.equal(startLessonItems.every((choices) => choices.length === 4), true);
});

test('distractor scoring prefers similar forms and introduced content', () => {
  const item = { id: 'right', hanzi: '复习', packId: 'app-ui-basics', lessonId: 'review-actions' };
  const similar = { id: 'similar', hanzi: '学习', packId: 'app-ui-basics', lessonId: 'learn-actions' };
  const long = { id: 'long', hanzi: '许可与联系', packId: 'app-ui-basics', lessonId: 'settings-license-contact' };
  const progress = { cards: { known: { itemId: 'similar' } }, completedLessons: [] };
  assert.ok(scoreDistractor(item, similar, 'hanzi', progress) > scoreDistractor(item, long, 'hanzi', progress));
});

test('review does not use typing before exercise type is unlocked', () => {
  const card = { seenCount: 3, correctStreak: 3 };
  assert.equal(reviewKindFor(card, { unlockedExerciseTypes: [] }), 'mc-sv-zh');
});

test('review uses pinyin and hanzi typing only after each type is unlocked', () => {
  assert.deepEqual(reviewKindsFor({ seenCount: 2, correctStreak: 1 }, { unlockedExerciseTypes: ['type-pinyin'] }), ['mc-zh-sv', 'type-pinyin']);
  assert.equal(reviewKindFor({ seenCount: 4, correctStreak: 3 }, { unlockedExerciseTypes: ['type-pinyin'] }), 'type-pinyin');
  assert.equal(reviewKindFor({ seenCount: 4, correctStreak: 3 }, { unlockedExerciseTypes: ['type-pinyin', 'type-hanzi'] }), 'type-hanzi');
});

test('completed lessons also count as unlocked exercise types for older local data', () => {
  const unlocked = unlockedExerciseTypesFor({ completedLessons: ['app-ui-basics/first-characters'], unlockedExerciseTypes: [] });
  assert.equal(unlocked.has('type-pinyin'), true);
});
