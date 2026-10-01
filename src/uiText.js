import { allItems, allLessons, completedLessonRevision, lessonUiKeysForRevision } from './content/packs.js';
import { uiTermByKey } from './content/uiTerms.js';
import { isMasteredCard } from './mastery.js';
import { cardId } from './srs.js';

const uiItemByKey = Object.fromEntries(allItems.flatMap((item) =>
  (item.uiKeys || (item.uiKey ? [item.uiKey] : [])).map((key) => [key, item])
));

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

function displayTemplates(progress, key) {
  const term = uiTermByKey[key];
  if (!term) return null;
  const mode = progress?.settings?.uiMode || 'dynamic';
  const unlocked = isUnlocked(progress, key);

  if (mode === 'sv' || (!unlocked && mode !== 'zh-all')) return [term.sv];
  if (mode === 'zh' || mode === 'zh-all') return [term.zh];
  if (isMasteredUiKey(progress, key)) return [term.zh];
  return [term.zh, term.sv];
}

export function uiLabel(progress, key, values = {}) {
  const templates = displayTemplates(progress, key);
  if (!templates) return key;
  return templates.map((template) => interpolate(template, values)).join(' · ');
}

// Returns an array of plain strings and { value } parts so callers can mark
// interpolated values (e.g. the queried term in prompts) with markup.
export function uiLabelParts(progress, key, values = {}) {
  const templates = displayTemplates(progress, key);
  if (!templates) return [key];
  const parts = [];
  templates.forEach((template, templateIndex) => {
    if (templateIndex > 0) parts.push(' · ');
    String(template).split(/\{(\w+)\}/g).forEach((part, partIndex) => {
      if (partIndex % 2 === 0) {
        if (part) parts.push(part);
        return;
      }
      const value = values[part];
      parts.push(value === undefined || value === null ? `{${part}}` : { value: String(value) });
    });
  });
  return parts;
}

export function uiHint(progress, key, values = {}) {
  const term = uiTermByKey[key];
  if (!term) return '';
  const mode = progress?.settings?.uiMode || 'dynamic';
  if ((mode !== 'zh-all' && !isUnlocked(progress, key)) || mode === 'sv') return '';
  return `${interpolate(term.sv, values)} · ${interpolate(term.pinyin, values)}`;
}
