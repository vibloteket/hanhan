const DAY = 24 * 60 * 60 * 1000;
const MINUTE = 60 * 1000;

export function createCard(itemId) {
  return {
    itemId,
    dueAt: new Date().toISOString(),
    intervalDays: 0,
    ease: 2.3,
    seenCount: 0,
    correctStreak: 0,
    wrongCount: 0,
    lastResult: null,
  };
}

export function ensureCards(progress, items) {
  const cards = { ...progress.cards };
  for (const item of items) {
    if (!cards[item.id]) cards[item.id] = createCard(item.id);
  }
  return { ...progress, cards };
}

export function dueCards(progress, items, now = new Date()) {
  const nowMs = now.getTime();
  return items
    .map((item) => ({ item, card: progress.cards[item.id] }))
    .filter(({ card }) => card && new Date(card.dueAt).getTime() <= nowMs)
    .sort((a, b) => new Date(a.card.dueAt) - new Date(b.card.dueAt));
}

export function updateCard(card, result) {
  const next = { ...card, seenCount: (card.seenCount || 0) + 1, lastResult: result };
  const wasCorrect = Boolean(result.correct);
  const mode = result.mode || 'multiple-choice';

  if (!wasCorrect) {
    next.correctStreak = 0;
    next.wrongCount = (card.wrongCount || 0) + 1;
    next.ease = Math.max(1.3, (card.ease || 2.3) - 0.2);
    next.intervalDays = 0;
    next.dueAt = new Date(Date.now() + 15 * MINUTE).toISOString();
    return next;
  }

  const credit = mode === 'type-hanzi' ? 1.4 : mode === 'type-pinyin' ? 1.15 : 0.75;
  next.correctStreak = (card.correctStreak || 0) + 1;
  next.ease = Math.min(3.0, (card.ease || 2.3) + (mode === 'multiple-choice' ? 0.02 : 0.05));

  let intervalDays;
  if (!card.intervalDays || card.intervalDays < 0.5) intervalDays = credit;
  else intervalDays = Math.max(1, card.intervalDays * next.ease * credit);

  next.intervalDays = Math.min(90, intervalDays);
  next.dueAt = new Date(Date.now() + next.intervalDays * DAY).toISOString();
  return next;
}
