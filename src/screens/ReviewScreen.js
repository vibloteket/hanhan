import { html } from '../html.js';
import { useMemo, useState } from 'preact/hooks';
import { allItems, itemById } from '../content/packs.js';
import { updateCard } from '../srs.js';
import { answerReviewQueue, createReviewQueue, reviewProgressLabel } from '../reviewQueue.js';
import { Button } from '../components/Button.js';
import { UiText } from '../components/UiText.js';
import { ExerciseCard } from '../components/ExerciseCard.js';

export function ReviewScreen({ progress, setProgress, go }) {
  const initialQueue = useMemo(() => createReviewQueue(progress, allItems), []);
  const [queue, setQueue] = useState(initialQueue);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [deferredCount, setDeferredCount] = useState(0);
  const currentEntry = queue[0];
  const currentItem = currentEntry ? itemById[currentEntry.itemId] : null;

  function answer(result) {
    if (!currentEntry || !currentItem) return;
    setProgress((currentProgress) => {
      const oldCard = currentProgress.cards[currentItem.id];
      const cardResult = result.correct && (currentEntry.attempts || 0) > 0 ? { ...result, hard: true } : result;
      const cards = { ...currentProgress.cards, [currentItem.id]: updateCard(oldCard, cardResult) };
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
    if (!result.correct && (currentEntry.attempts || 0) >= 1) {
      setDeferredCount((value) => value + 1);
    }
    setQueue((currentQueue) => answerReviewQueue(currentQueue, result));
    // Only count this answer if the entry was new (attempts=0) and will be removed from the queue
    if ((currentEntry.attempts || 0) === 0 && result.correct) {
      setAnsweredCount((value) => value + 1);
    }
  }

  return html`
    <section class="screen lesson-screen">
      <div class="focus-top-row">
        <button class="brand-mark mini" onClick=${() => go('home')} aria-label="Hem"><img src="./assets/icons/icon.svg?v=67" alt="" /></button>
        <${Button} progress=${progress} labelKey="action.back" kind="ghost" onClick=${() => go('home')} />
        <span class="focus-spacer"></span>
        <span class="pill">${reviewProgressLabel(answeredCount, queue.length)}</span>
      </div>
      <h1><${UiText} progress=${progress} id="review.title" /></h1>

      ${!initialQueue.length ? html`
        <section class="exercise-card complete-card">
          <h2>Inget att repetera just nu</h2>
          <p>Gör en ny lektion eller kom tillbaka senare.</p>
          <${Button} progress=${progress} labelKey="nav.home" onClick=${() => go('home')} />
        </section>
      ` : currentEntry && currentItem ? html`
        <${ExerciseCard}
          progress=${progress}
          step=${{ kind: currentEntry.kind, item: currentItem }}
          onAnswer=${answer}
        />
      ` : html`
        <section class="exercise-card complete-card">
          <h2>Klar för nu</h2>
          <p>${deferredCount ? `${deferredCount} svåra kort kommer tillbaka senare.` : 'Bra jobbat. Om du missade något fick det komma tillbaka i samma runda.'}</p>
          <${Button} progress=${progress} labelKey="nav.home" onClick=${() => go('home')} />
        </section>
      `}
    </section>
  `;
}
