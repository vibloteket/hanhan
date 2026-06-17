export const MASTERED_STREAK = 4;

export function isMasteredCard(card) {
  return (card?.correctStreak || 0) >= MASTERED_STREAK;
}
