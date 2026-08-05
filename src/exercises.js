import { allItems, allLessons, lessonKey } from './content/packs.js';

function hash(text) {
  let value = 0;
  for (let i = 0; i < text.length; i += 1) value = (value * 31 + text.charCodeAt(i)) >>> 0;
  return value;
}

function meaningParts(label) {
  return new Set(String(label || '')
    .toLocaleLowerCase('sv-SE')
    .normalize('NFC')
    .replace(/[()]/g, '/')
    .split(/\s*(?:\/|,|;|\|)\s*/)
    .map((part) => part.trim())
    .filter(Boolean));
}

function meaningsOverlap(first, second) {
  const firstParts = meaningParts(first);
  return [...meaningParts(second)].some((part) => firstParts.has(part));
}

function swedishFormKey(label) {
  return String(label || '')
    .toLocaleLowerCase('sv-SE')
    .normalize('NFC')
    .trim()
    .replace(/([a-zåäö]{4,})a\b/gu, '$1');
}

function swedishFormsOverlap(first, second) {
  const firstKeys = new Set([...meaningParts(first)].map(swedishFormKey));
  return [...meaningParts(second)].some((part) => firstKeys.has(swedishFormKey(part)));
}

function characterSet(value) {
  return new Set(Array.from(String(value || '')).filter((character) => /\p{Script=Han}/u.test(character)));
}

function isExplicitComponent(item, candidate) {
  return item.components?.some((component) => component.hanzi === candidate.hanzi)
    || candidate.components?.some((component) => component.hanzi === item.hanzi)
    || false;
}

function isIntroduced(candidate, progress) {
  if (Object.values(progress?.cards || {}).some((card) => card.itemId === candidate.id)) return true;
  return progress?.completedLessons?.includes(lessonKey(candidate.packId, candidate.lessonId)) || false;
}

function isExcludedDistractor(item, candidate) {
  return item.distractorExclusions?.some((pair) =>
    Array.isArray(pair)
    && pair.length === 2
    && pair.includes(item.id)
    && pair.includes(candidate.id)
  ) || false;
}

export function scoreDistractor(item, candidate, field, progress = null) {
  let score = 0;
  const correctLength = Array.from(item[field] || '').length;
  const candidateLength = Array.from(candidate[field] || '').length;
  const lengthDifference = Math.abs(correctLength - candidateLength);

  if (field === 'hanzi') {
    if (lengthDifference === 0) score += 120;
    else if (lengthDifference === 1) score += 25;

    const correctCharacters = characterSet(item.hanzi);
    if ([...characterSet(candidate.hanzi)].some((character) => correctCharacters.has(character))) score += 20;
  } else {
    if (lengthDifference === 0) score += 20;
    else if (lengthDifference <= 3) score += 10;
  }

  if (candidate.lessonId && candidate.lessonId === item.lessonId && candidate.packId === item.packId) score += 25;
  else if (candidate.packId && candidate.packId === item.packId) score += 10;
  if (isIntroduced(candidate, progress)) score += 15;
  return score;
}

function keepBest(ranked, entry, limit) {
  const index = ranked.findIndex((existing) =>
    entry.score > existing.score || (entry.score === existing.score && entry.tieBreak < existing.tieBreak)
  );
  if (index === -1) ranked.push(entry);
  else ranked.splice(index, 0, entry);
  if (ranked.length > limit) ranked.pop();
}

export function pickChoices(item, field, count = 4, progress = null) {
  const correctLabel = item[field];
  const pool = [];

  for (const candidate of allItems) {
    if (
      candidate.id === item.id
      || !candidate[field]
      || candidate[field] === correctLabel
      || isExcludedDistractor(item, candidate)
    ) continue;
    if (field === 'sv' && (
      candidate.hanzi === item.hanzi
      || meaningsOverlap(correctLabel, candidate[field])
      || isExplicitComponent(item, candidate)
    )) continue;
    const entry = {
      candidate,
      score: scoreDistractor(item, candidate, field, progress),
      tieBreak: hash(item.id + candidate.id),
    };
    const duplicateIndex = pool.findIndex((existing) =>
      existing.candidate[field] === candidate[field]
      || (field === 'sv' && swedishFormsOverlap(existing.candidate[field], candidate[field]))
    );
    if (duplicateIndex >= 0) {
      const duplicate = pool[duplicateIndex];
      if (entry.score < duplicate.score || (entry.score === duplicate.score && entry.tieBreak >= duplicate.tieBreak)) continue;
      pool.splice(duplicateIndex, 1);
    }
    keepBest(pool, entry, count - 1);
  }

  return [...pool.map((entry) => entry.candidate), item]
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
