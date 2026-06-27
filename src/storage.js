export const STORAGE_KEY = 'mandarinMode.progress.v1';
export const BACKUP_APP_ID = 'mandarinmode-static-spa';

export function createDefaultProgress() {
  return {
    schemaVersion: 1,
    completedLessons: [],
    lessonMeta: {},
    unlockedUiKeys: [],
    unlockedExerciseTypes: [],
    cards: {},
    activeSession: null,
    stats: {
      startedAt: new Date().toISOString(),
      lessonCompletions: 0,
      reviewAnswers: 0,
      correctAnswers: 0,
    },
    settings: {
      uiMode: 'dynamic',
    },
  };
}

export function normalizeProgress(input) {
  const defaults = createDefaultProgress();
  if (!input || typeof input !== 'object') return defaults;
  if (input.schemaVersion !== 1) return defaults;
  const rawSettings = { ...defaults.settings, ...(input.settings || {}) };
  const legacyDynamicModes = new Set(['gradual-assisted', 'gradual-hints']);
  const allowedUiModes = new Set(['dynamic', 'sv', 'zh', 'zh-all']);
  const uiMode = legacyDynamicModes.has(rawSettings.uiMode)
    ? 'dynamic'
    : allowedUiModes.has(rawSettings.uiMode)
      ? rawSettings.uiMode
      : defaults.settings.uiMode;
  return {
    ...defaults,
    ...input,
    completedLessons: Array.isArray(input.completedLessons) ? input.completedLessons : [],
    lessonMeta: input.lessonMeta && typeof input.lessonMeta === 'object' ? input.lessonMeta : {},
    unlockedUiKeys: Array.isArray(input.unlockedUiKeys) ? input.unlockedUiKeys : [],
    unlockedExerciseTypes: Array.isArray(input.unlockedExerciseTypes) ? input.unlockedExerciseTypes : [],
    cards: input.cards && typeof input.cards === 'object' ? input.cards : {},
    activeSession: input.activeSession && typeof input.activeSession === 'object' ? input.activeSession : null,
    stats: { ...defaults.stats, ...(input.stats || {}) },
    settings: { ...rawSettings, uiMode },
  };
}

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return normalizeProgress(raw ? JSON.parse(raw) : null);
  } catch (error) {
    console.warn('Could not load progress:', error);
    return createDefaultProgress();
  }
}

export function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeProgress(progress)));
}

export function makeBackup(progress) {
  return {
    app: BACKUP_APP_ID,
    version: 1,
    exportedAt: new Date().toISOString(),
    progress: normalizeProgress(progress),
  };
}

export function parseBackup(text) {
  const parsed = JSON.parse(text);
  if (!parsed || parsed.app !== BACKUP_APP_ID || !parsed.progress) {
    throw new Error('Det här verkar inte vara en backup från appen.');
  }
  return normalizeProgress(parsed.progress);
}
