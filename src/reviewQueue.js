import { reviewKindsFor } from './exercises.js';
import { dueCards } from './srs.js';

export function shuffleEntries(entries, rng = Math.random) {
  const shuffled = [...entries];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rng() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}

export function createReviewQueue(progress, items, rng = Math.random) {
  const due = dueCards(progress, items);
  const firstRound = [];
  const laterRounds = [];

  for (const { item, card } of due) {
    const [firstKind, ...extraKinds] = reviewKindsFor(card, progress);
    firstRound.push({ itemId: item.id, kind: firstKind, attempts: 0 });
    laterRounds.push(...extraKinds.map((kind) => ({ itemId: item.id, kind, attempts: 0 })));
  }

  return [...shuffleEntries(firstRound, rng), ...shuffleEntries(laterRounds, rng)];
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
