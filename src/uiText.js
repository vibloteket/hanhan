import { allLessons, lessonKey } from './content/packs.js';
import { uiTermByKey } from './content/uiTerms.js';

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

export function uiLabel(progress, key) {
  const term = uiTermByKey[key];
  if (!term) return key;
  const mode = progress.settings?.uiMode || 'gradual-assisted';
  const unlocked = isUnlocked(progress, key);

  if (mode === 'sv' || !unlocked) return term.sv;
  if (mode === 'zh') return term.zh;
  if (mode === 'gradual-hints') return term.zh;
  return `${term.zh} · ${term.sv}`;
}

export function uiHint(progress, key) {
  const term = uiTermByKey[key];
  if (!term) return '';
  const mode = progress.settings?.uiMode || 'gradual-assisted';
  if (!isUnlocked(progress, key) || mode === 'sv') return '';
  return `${term.sv} · ${term.pinyin}`;
}
