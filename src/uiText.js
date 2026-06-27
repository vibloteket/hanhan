import { allItems, allLessons, lessonKey } from './content/packs.js';
import { uiTermByKey } from './content/uiTerms.js';
import { isMasteredCard } from './mastery.js';

const uiItemByKey = Object.fromEntries(allItems.filter((item) => item.uiKey).map((item) => [item.uiKey, item]));

export function unlockedUiKeysFor(progress) {
  const unlocked = new Set(progress?.unlockedUiKeys || []);
  const completed = new Set(progress?.completedLessons || []);

  for (const lesson of allLessons) {
    if (!completed.has(lessonKey(lesson.packId, lesson.id))) continue;
    for (const key of lesson.unlocksUiKeys || []) unlocked.add(key);
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
  return Boolean(item && isMasteredCard(progress?.cards?.[item.id]));
}

export function uiLabel(progress, key) {
  const term = uiTermByKey[key];
  if (!term) return key;
  const mode = progress?.settings?.uiMode || 'dynamic';
  const unlocked = isUnlocked(progress, key);

  if (mode === 'sv' || (!unlocked && mode !== 'zh-all')) return term.sv;
  if (mode === 'zh' || mode === 'zh-all') return term.zh;
  if (isMasteredUiKey(progress, key)) return term.zh;
  return `${term.zh} · ${term.sv}`;
}

export function uiHint(progress, key) {
  const term = uiTermByKey[key];
  if (!term) return '';
  const mode = progress?.settings?.uiMode || 'dynamic';
  if ((mode !== 'zh-all' && !isUnlocked(progress, key)) || mode === 'sv') return '';
  return `${term.sv} · ${term.pinyin}`;
}
