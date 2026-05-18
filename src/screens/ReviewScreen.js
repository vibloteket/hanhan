import { html } from '../html.js';
import { useMemo, useState } from 'preact/hooks';
import { allItems, itemById } from '../content/packs.js';
import { updateCard } from '../srs.js';
import { reviewKindFor } from '../exercises.js';
import { answerReviewQueue, createReviewQueue, reviewProgressLabel } from '../reviewQueue.js';
import { Button } from '../components/Button.js';
import { ExerciseCard } from '../components/ExerciseCard.js';

export function ReviewScreen({ progress, setProgress, go }) {
  const initialQueueIds = useMemo(() => createReviewQueue(progress, allItems), []);
  const [queueIds, setQueueIds] = useState(initialQueueIds);
  const [answeredCount, setAnsweredCount] = useState(0);
  const currentItem = itemById[queueIds[0]];
  const currentCard = currentItem ? progress.cards[currentItem.id] : null;
  const remainingCount = queueIds.length;
  const totalCount = answeredCount + remainingCount;

  function answer(result) {
    if (!currentItem) return;
    setProgress((currentProgress) => {
      const oldCard = currentProgress.cards[currentItem.id];
      const cards = { ...currentProgress.cards, [currentItem.id]: updateCard(oldCard, result) };
      return {
        ...currentProgress,
        cards,
        stats: {
          ...currentProgress.stats,
          reviewAnswers: (currentProgress.stats.reviewAnswers || 0) + 1,
          correctAnswers: (currentProgress.stats.correctAnswers || 0) + (result.correct ? 1 : 0),
        },
      };
    });
    setQueueIds((currentQueue) => answerReviewQueue(currentQueue, currentItem.id, result));
    setAnsweredCount((value) => value + 1);
  }

  return html`
    <section class="screen lesson-screen">
      <div class="focus-top-row">
        <button class="brand-mark mini" onClick=${() => go('home')} aria-label="Hem"><img src="./assets/icons/icon.svg" alt="" /></button>
        <${Button} progress=${progress} labelKey="action.back" kind="ghost" onClick=${() => go('home')} />
        <span class="focus-spacer"></span>
        <span class="pill">${reviewProgressLabel(answeredCount, remainingCount)}</span>
      </div>
      <h1>Repetition</h1>

      ${!initialQueueIds.length ? html`
        <section class="exercise-card complete-card">
          <h2>Inget att repetera just nu</h2>
          <p>Gör en ny lektion eller kom tillbaka senare.</p>
          <${Button} progress=${progress} labelKey="nav.home" onClick=${() => go('home')} />
        </section>
      ` : currentItem ? html`
        <${ExerciseCard}
          progress=${progress}
          step=${{ kind: reviewKindFor(currentCard, progress), item: currentItem }}
          onAnswer=${answer}
        />
      ` : html`
        <section class="exercise-card complete-card">
          <h2>Klar för nu</h2>
          <p>Bra jobbat. Om du missade något fick det komma tillbaka i samma runda.</p>
          <${Button} progress=${progress} labelKey="nav.home" onClick=${() => go('home')} />
        </section>
      `}
    </section>
  `;
}
