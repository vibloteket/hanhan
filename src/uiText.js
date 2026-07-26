import { allItems, allLessons, completedLessonRevision, lessonUiKeysForRevision } from './content/packs.js';
import { uiTermByKey } from './content/uiTerms.js';
import { isMasteredCard } from './mastery.js';
import { cardId } from './srs.js';

const uiItemByKey = Object.fromEntries(allItems.filter((item) => item.uiKey).map((item) => [item.uiKey, item]));

export function unlockedUiKeysFor(progress) {
  const unlocked = new Set(progress?.unlockedUiKeys || []);

  for (const lesson of allLessons) {
    const revision = completedLessonRevision(progress, lesson.packId, lesson.id);
    if (!revision) continue;
    for (const key of lessonUiKeysForRevision(lesson, revision)) unlocked.add(key);
  }

  return unlocked;
}

export function isUnlocked(progress, key) {
  return unlockedUiKeysFor(progress).has(key);
}

export function uiItemForKey(key) {
  return uiItemByKey[key];
}

export function isMasteredUiKey(progress, key) {
  const item = uiItemForKey(key);
  return Boolean(item && isMasteredCard(progress?.cards?.[cardId(item.id, 'recognize-meaning')]));
}

function interpolate(text, values = {}) {
  return String(text).replace(/\{(\w+)\}/g, (match, key) => values[key] ?? match);
}

export function uiLabel(progress, key, values = {}) {
  const term = uiTermByKey[key];
  if (!term) return key;
  const mode = progress?.settings?.uiMode || 'dynamic';
  const unlocked = isUnlocked(progress, key);

  if (mode === 'sv' || (!unlocked && mode !== 'zh-all')) return interpolate(term.sv, values);
  if (mode === 'zh' || mode === 'zh-all') return interpolate(term.zh, values);
  if (isMasteredUiKey(progress, key)) return interpolate(term.zh, values);
  return `${interpolate(term.zh, values)} · ${interpolate(term.sv, values)}`;
}

export function uiHint(progress, key, values = {}) {
  const term = uiTermByKey[key];
  if (!term) return '';
  const mode = progress?.settings?.uiMode || 'dynamic';
  if ((mode !== 'zh-all' && !isUnlocked(progress, key)) || mode === 'sv') return '';
  return `${interpolate(term.sv, values)} · ${interpolate(term.pinyin, values)}`;
}
