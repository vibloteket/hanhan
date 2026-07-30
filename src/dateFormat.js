import { lessonKey } from './content/packs.js';

export const UI_DATE_LESSON_KEY = lessonKey('app-ui-basics', 'dates-in-ui');

export function usesChineseDateFormat(progress) {
  return progress?.completedLessons?.includes(UI_DATE_LESSON_KEY) || progress?.settings?.uiMode === 'zh-all';
}

export function formatUiDate(value, progress, { includeTime = false, timeOnlyToday = false, now = new Date() } = {}) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const time = date.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
  if (timeOnlyToday && date.toDateString() === now.toDateString()) return time;

  const datePart = usesChineseDateFormat(progress)
    ? `${date.getMonth() + 1}月${date.getDate()}日`
    : date.toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' });

  return includeTime ? `${datePart} ${time}` : datePart;
}
