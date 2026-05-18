import { dueCards } from './srs.js';

export function createReviewQueue(progress, items) {
  return dueCards(progress, items).map(({ item }) => item.id);
}

export function currentReviewItem(queueIds, itemById) {
  if (!queueIds.length) return null;
  return itemById[queueIds[0]] || null;
}

export function answerReviewQueue(queueIds, itemId, result) {
  if (!queueIds.length) return [];
  const [, ...rest] = queueIds;
  return result?.correct ? rest : [...rest, itemId];
}

export function reviewProgressLabel(answeredCount, remainingCount) {
  const totalCount = answeredCount + remainingCount;
  if (!totalCount) return '0/0';
  return `${Math.min(answeredCount + 1, totalCount)}/${totalCount}`;
}
