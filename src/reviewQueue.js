import { dueCards } from './srs.js';

export function shuffleEntries(entries, rng = Math.random) {
  const shuffled = [...entries];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

export function groupHanziTypingLast(entries) {
  return [
    ...entries.filter((entry) => entry.kind !== 'type-hanzi'),
    ...entries.filter((entry) => entry.kind === 'type-hanzi'),
  ];
}

export function createReviewQueue(progress, items, rng = Math.random) {
  const entries = dueCards(progress, items).map(({ item, cardId, skill, kind }) => ({
    cardId,
    itemId: item.id,
    skill,
    kind,
    attempts: 0,
  }));
  return groupHanziTypingLast(shuffleEntries(entries, rng));
}

export function currentReviewItem(queueEntries, itemById) {
  if (!queueEntries.length) return null;
  return itemById[queueEntries[0].itemId] || null;
}

export function answerReviewQueue(queueEntries, result, maxRetries = 1) {
  if (!queueEntries.length) return [];
  const [current, ...rest] = queueEntries;
  if (result?.correct) return rest;
  const attempts = current.attempts || 0;
  if (attempts >= maxRetries) return rest;
  return [{ ...current, attempts: attempts + 1 }, ...rest];
}

export function reviewProgressLabel(answeredCount, remainingCount) {
  const totalCount = answeredCount + remainingCount;
  if (!totalCount) return '0/0';
  return `${Math.min(answeredCount + 1, totalCount)}/${totalCount}`;
}
