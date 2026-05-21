import { allItems } from './content/packs.js';

function hash(text) {
  let value = 0;
  for (let i = 0; i < text.length; i += 1) value = (value * 31 + text.charCodeAt(i)) >>> 0;
  return value;
}

export function pickChoices(item, field, count = 4) {
  const pool = allItems
    .filter((candidate) => candidate.id !== item.id)
    .sort((a, b) => hash(item.id + a.id) - hash(item.id + b.id))
    .slice(0, count - 1);
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

export function reviewKindFor(card, progress) {
  const streak = card?.correctStreak || 0;
  const seen = card?.seenCount || 0;
  const unlocked = progress?.unlockedExerciseTypes || [];
  const canTypePinyin = unlocked.includes('type-pinyin');
  const canTypeHanzi = unlocked.includes('type-hanzi');

  if (canTypeHanzi && streak >= 3) return 'type-hanzi';
  if (canTypePinyin && (streak >= 1 || seen >= 2)) return 'type-pinyin';
  return seen % 2 === 0 ? 'mc-zh-sv' : 'mc-sv-zh';
}
