import { appUiBasics } from './appUiBasics.js';
import { homeBasics } from './homeBasics.js';

export const packs = [appUiBasics, homeBasics].sort((a, b) => a.order - b.order);

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
  return lesson ? { ...lesson, packId, packTitleSv: pack.titleSv } : null;
}

export function lessonKey(packId, lessonId) {
  return `${packId}/${lessonId}`;
}

export function findNextLesson(progress) {
  for (const pack of packs) {
    for (const lesson of pack.lessons) {
      if (!progress.completedLessons.includes(lessonKey(pack.id, lesson.id))) {
        return { packId: pack.id, lessonId: lesson.id };
      }
    }
  }
  return null;
}
