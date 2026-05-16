import { html } from '../html.js';
import { useMemo, useState } from 'preact/hooks';
import { allItems } from '../content/packs.js';
import { dueCards, updateCard } from '../srs.js';
import { reviewKindFor } from '../exercises.js';
import { Button } from '../components/Button.js';
import { ExerciseCard } from '../components/ExerciseCard.js';

export function ReviewScreen({ progress, setProgress, go }) {
  const queue = useMemo(() => dueCards(progress, allItems), [progress]);
  const [index, setIndex] = useState(0);
  const current = queue[index];

  function answer(result) {
    if (!current) return;
    setProgress((currentProgress) => {
      const oldCard = currentProgress.cards[current.item.id];
      const cards = { ...currentProgress.cards, [current.item.id]: updateCard(oldCard, result) };
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
    setIndex((value) => value + 1);
  }

  return html`
    <section class="screen lesson-screen">
      <div class="top-row">
        <${Button} progress=${progress} labelKey="action.back" kind="ghost" onClick=${() => go('home')} />
        <span class="pill">${Math.min(index + 1, queue.length)}/${queue.length}</span>
      </div>
      <h1>Repetition</h1>

      ${!queue.length ? html`
        <section class="exercise-card complete-card">
          <h2>Inget att repetera just nu</h2>
          <p>Gör en ny lektion eller kom tillbaka senare.</p>
          <${Button} progress=${progress} labelKey="nav.home" onClick=${() => go('home')} />
        </section>
      ` : current ? html`
        <${ExerciseCard}
          progress=${progress}
          step=${{ kind: reviewKindFor(current.card), item: current.item }}
          onAnswer=${answer}
        />
      ` : html`
        <section class="exercise-card complete-card">
          <h2>Klar för nu</h2>
          <p>Bra jobbat. Felaktiga svar kommer tillbaka snart.</p>
          <${Button} progress=${progress} labelKey="nav.home" onClick=${() => go('home')} />
        </section>
      `}
    </section>
  `;
}
