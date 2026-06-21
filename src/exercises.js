import { allItems, allLessons, lessonKey } from './content/packs.js';

function hash(text) {
  let value = 0;
  for (let i = 0; i < text.length; i += 1) value = (value * 31 + text.charCodeAt(i)) >>> 0;
  return value;
}

export function pickChoices(item, field, count = 4) {
  const correctLabel = item[field];
  const seenLabels = new Set([correctLabel]);
  const pool = [];

  for (const candidate of allItems
    .filter((candidate) => candidate.id !== item.id && candidate[field] && candidate[field] !== correctLabel)
    .sort((a, b) => hash(item.id + a.id) - hash(item.id + b.id))) {
    if (seenLabels.has(candidate[field])) continue;
    seenLabels.add(candidate[field]);
    pool.push(candidate);
    if (pool.length >= count - 1) break;
  }

  return [...pool, item]
    .sort((a, b) => hash(field + a.id + item.id) - hash(field + b.id + item.id))
    .map((candidate) => ({ id: candidate.id, label: candidate[field] }));
}

export function lessonSteps(lesson, progress = null) {
  const steps = [];
  const unlockedExerciseTypes = progress?.unlockedExerciseTypes || [];
  const introducedHere = lesson.unlocksExerciseTypes || [];
  const practiceModes = (lesson.practiceModes || []).filter((mode) =>
    unlockedExerciseTypes.includes(mode) || introducedHere.includes(mode)
  );
  for (const item of lesson.items) {
    steps.push({ kind: 'intro', item });
    steps.push({ kind: 'mc-zh-sv', item });
    steps.push({ kind: 'mc-sv-zh', item });
    if (practiceModes.includes('type-pinyin')) steps.push({ kind: 'type-pinyin', item });
    if (practiceModes.includes('type-hanzi')) steps.push({ kind: 'type-hanzi', item });
  }
  return steps;
}

export function unlockedExerciseTypesFor(progress) {
  const unlocked = new Set(progress?.unlockedExerciseTypes || []);
  const completed = new Set(progress?.completedLessons || []);
  for (const lesson of allLessons) {
    if (!completed.has(lessonKey(lesson.packId, lesson.id))) continue;
    for (const type of lesson.unlocksExerciseTypes || []) unlocked.add(type);
  }
  return unlocked;
}

export function reviewKindsFor(card, progress) {
  const streak = card?.correctStreak || 0;
  const seen = card?.seenCount || 0;
  const unlocked = unlockedExerciseTypesFor(progress);
  const kinds = [seen % 2 === 0 ? 'mc-zh-sv' : 'mc-sv-zh'];

  if (unlocked.has('type-pinyin')) kinds.push('type-pinyin');
  if (unlocked.has('type-hanzi') && streak >= 3) kinds.push('type-hanzi');
  return kinds;
}

export function reviewKindFor(card, progress) {
  return reviewKindsFor(card, progress).at(-1);
}
