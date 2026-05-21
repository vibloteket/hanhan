import { reviewKindsFor } from './exercises.js';
import { dueCards } from './srs.js';

export function createReviewQueue(progress, items) {
  return dueCards(progress, items).flatMap(({ item, card }) =>
    reviewKindsFor(card, progress).map((kind) => ({ itemId: item.id, kind }))
  );
}

export function currentReviewItem(queueEntries, itemById) {
  if (!queueEntries.length) return null;
  return itemById[queueEntries[0].itemId] || null;
}

export function answerReviewQueue(queueEntries, result) {
  if (!queueEntries.length) return [];
  const [current, ...rest] = queueEntries;
  return result?.correct ? rest : [...rest, current];
}

export function reviewProgressLabel(answeredCount, remainingCount) {
  const totalCount = answeredCount + remainingCount;
  if (!totalCount) return '0/0';
  return `${Math.min(answeredCount + 1, totalCount)}/${totalCount}`;
}
