import { uiTermByKey } from './content/uiTerms.js';

export function isUnlocked(progress, key) {
  return progress.unlockedUiKeys.includes(key);
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
