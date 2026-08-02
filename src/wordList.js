import { lessonKey } from './content/packs.js';

export const WORD_LIST_SORTS = [
  { id: 'recent-review', label: 'Senast repeterade' },
  { id: 'hardest', label: 'Svårast' },
  { id: 'strongest', label: 'Sitter bäst' },
  { id: 'recent-learned', label: 'Senast inlärda' },
  { id: 'pinyin', label: 'Pinyin A–Ö' },
  { id: 'swedish', label: 'Svenska A–Ö' },
];

export const DEFAULT_WORD_LIST_SORT = 'recent-review';

function time(value) {
  const parsed = value ? new Date(value).getTime() : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

export function lastReviewedAt(entry) {
  return Math.max(0, ...entry.skills.map(({ card }) => time(card.lastReviewedAt)));
}

export function learnedAt(entry, progress) {
  return time(progress.lessonMeta?.[lessonKey(entry.item.packId, entry.item.lessonId)]?.completedAt);
}

export function knowledgeScore(entry) {
  return entry.skills.reduce((total, { card }) => {
    const seen = card.seenCount || 0;
    const wrong = card.wrongCount || 0;
    const accuracy = seen ? (seen - wrong) / seen : 0;
    return total
      + (card.correctStreak || 0) * 12
      + Math.min(card.intervalDays || 0, 30)
      + accuracy * 8
      + (card.ease || 2.3)
      - wrong * 3;
  }, 0);
}

function textCompare(a, b, field) {
  return String(a.item[field] || '').localeCompare(String(b.item[field] || ''), 'sv', { sensitivity: 'base' });
}

function stableFallback(a, b) {
  return textCompare(a, b, 'pinyin') || textCompare(a, b, 'hanzi') || a.item.id.localeCompare(b.item.id);
}

export function sortWordList(entries, sortId, progress) {
  const sorted = [...entries];
  sorted.sort((a, b) => {
    let result = 0;
    if (sortId === 'hardest') result = knowledgeScore(a) - knowledgeScore(b);
    else if (sortId === 'strongest') result = knowledgeScore(b) - knowledgeScore(a);
    else if (sortId === 'recent-learned') result = learnedAt(b, progress) - learnedAt(a, progress);
    else if (sortId === 'pinyin') result = textCompare(a, b, 'pinyin');
    else if (sortId === 'swedish') result = textCompare(a, b, 'sv');
    else result = lastReviewedAt(b) - lastReviewedAt(a);
    return result || stableFallback(a, b);
  });
  return sorted;
}
