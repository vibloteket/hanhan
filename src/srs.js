const DAY = 24 * 60 * 60 * 1000;
const MINUTE = 60 * 1000;

export const REVIEW_SKILLS = [
  { id: 'recognize-meaning', kind: 'mc-zh-sv', label: 'Betydelse', labelKey: 'term.meaning' },
  { id: 'recall-hanzi', kind: 'mc-sv-zh', label: 'Tecken', labelKey: 'term.hanzi' },
  { id: 'recall-pinyin', kind: 'type-pinyin', label: 'Pinyin', labelKey: 'term.pinyin' },
];

export function reviewKindForSkill(skill, progress, card = null) {
  const readyForTyping = (card?.correctStreak || 0) >= 2;
  if (skill.id === 'recall-hanzi' && progress?.settings?.hanziTyping === true && readyForTyping) return 'type-hanzi';
  return skill.kind;
}

export function cardId(itemId, skill) {
  return `${itemId}/${skill}`;
}

export function createCard(itemId, skill = 'recognize-meaning') {
  return {
    itemId,
    skill,
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
    for (const { id: skill } of REVIEW_SKILLS) {
      const id = cardId(item.id, skill);
      if (!cards[id]) cards[id] = createCard(item.id, skill);
    }
  }
  return { ...progress, cards };
}

export function dueCards(progress, items, now = new Date()) {
  const nowMs = now.getTime();
  const due = [];
  for (const item of items) {
    for (const skill of REVIEW_SKILLS) {
      const id = cardId(item.id, skill.id);
      const card = progress.cards[id];
      if (card && new Date(card.dueAt).getTime() <= nowMs) {
        due.push({ item, card, cardId: id, skill: skill.id, kind: reviewKindForSkill(skill, progress, card) });
      }
    }
  }
  return due.sort((a, b) => new Date(a.card.dueAt) - new Date(b.card.dueAt));
}

export function updateCard(card, result, now = new Date()) {
  const next = {
    ...card,
    seenCount: (card.seenCount || 0) + 1,
    lastResult: result,
    lastReviewedAt: now.toISOString(),
  };
  const wasCorrect = Boolean(result.correct);
  const mode = result.mode || 'multiple-choice';

  if (!wasCorrect) {
    next.correctStreak = 0;
    next.wrongCount = (card.wrongCount || 0) + 1;
    next.ease = Math.max(1.3, (card.ease || 2.3) - 0.2);
    next.intervalDays = 0;
    next.dueAt = new Date(now.getTime() + 15 * MINUTE).toISOString();
    return next;
  }

  if (result.hard) {
    next.correctStreak = 0;
    next.ease = Math.max(1.3, card.ease || 2.3);
    next.intervalDays = 0;
    next.dueAt = new Date(now.getTime() + 15 * MINUTE).toISOString();
    return next;
  }

  const credit = mode === 'type-hanzi' ? 1.4 : mode === 'type-pinyin' ? 1.15 : 0.75;
  next.correctStreak = (card.correctStreak || 0) + 1;
  next.ease = Math.min(3.0, (card.ease || 2.3) + (mode === 'multiple-choice' ? 0.02 : 0.05));

  let intervalDays;
  if (!card.intervalDays || card.intervalDays < 0.5) intervalDays = credit;
  else intervalDays = Math.max(1, card.intervalDays * next.ease * credit);

  next.intervalDays = Math.min(90, intervalDays);
  next.dueAt = new Date(now.getTime() + next.intervalDays * DAY).toISOString();
  return next;
}
