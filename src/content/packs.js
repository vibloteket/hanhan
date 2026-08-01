import { appUiBasics } from './appUiBasics.js';
import { homeBasics } from './homeBasics.js';
import { personalBonus } from './personalBonus.js';

export const packs = [appUiBasics, homeBasics, personalBonus].sort((a, b) => a.order - b.order);

export const packById = Object.fromEntries(packs.map((pack) => [pack.id, pack]));

export const allLessons = packs.flatMap((pack) =>
  pack.lessons.map((lesson) => ({ ...lesson, packId: pack.id, packTitleSv: pack.titleSv }))
);

export const allItems = packs.flatMap((pack) =>
  pack.lessons.flatMap((lesson) =>
    lesson.items.map((item) => ({ ...item, packId: pack.id, lessonId: lesson.id, lessonTitleSv: lesson.titleSv }))
  )
);

export const itemById = Object.fromEntries(allItems.map((item) => [item.id, item]));

export function getLesson(packId, lessonId) {
  const pack = packById[packId];
  const lesson = pack?.lessons.find((candidate) => candidate.id === lessonId);
  return lesson ? {
    ...lesson,
    packId,
    packTitleSv: pack.titleSv,
    items: lesson.items.map((item) => ({ ...item, packId, lessonId })),
  } : null;
}

export function lessonKey(packId, lessonId) {
  return `${packId}/${lessonId}`;
}

export function lessonRevision(lesson) {
  return lesson?.revision || 1;
}

export function completedLessonRevision(progress, packId, lessonId) {
  const key = lessonKey(packId, lessonId);
  if (!progress?.completedLessons?.includes(key)) return 0;
  return progress.lessonMeta?.[key]?.revision || 1;
}

export function lessonNeedsUpdate(progress, lesson) {
  const completedRevision = completedLessonRevision(progress, lesson.packId, lesson.id);
  return completedRevision > 0 && completedRevision < lessonRevision(lesson);
}

export function lessonItemsForRevision(lesson, fromRevision = 0) {
  const targetRevision = lessonRevision(lesson);
  return lesson.items.filter((item) => {
    const added = item.addedInRevision || 1;
    return added > fromRevision && added <= targetRevision;
  });
}

export function lessonUiKeysForRevision(lesson, revision = lessonRevision(lesson)) {
  return (lesson.unlocksUiKeys || []).filter((key) => (lesson.uiKeyRevisions?.[key] || 1) <= revision);
}

export function findNextLesson(progress) {
  for (const lesson of allLessons) {
    const completed = completedLessonRevision(progress, lesson.packId, lesson.id) > 0;
    if (!completed || lessonNeedsUpdate(progress, lesson)) {
      return { packId: lesson.packId, lessonId: lesson.id };
    }
  }
  return null;
}
