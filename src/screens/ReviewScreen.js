import { html } from '../html.js';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { allItems, itemById } from '../content/packs.js';
import { updateCard } from '../srs.js';
import { answerReviewQueue, createReviewQueue, groupHanziTypingLast, reviewProgressLabel } from '../reviewQueue.js';
import { Button } from '../components/Button.js';
import { UiText } from '../components/UiText.js';
import { ExerciseCard } from '../components/ExerciseCard.js';

export function ReviewScreen({ progress, setProgress, go }) {
  const initialQueue = useMemo(() => createReviewQueue(progress, allItems), []);
  const [queue, setQueue] = useState(initialQueue);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [deferredCount, setDeferredCount] = useState(0);
  const [typingPromptHandled, setTypingPromptHandled] = useState(false);
  // Defer card updates until we leave the review screen
  const pendingCards = useRef({});
  const homeButtonRef = useRef(null);
  const currentEntry = queue[0];
  const currentItem = currentEntry ? itemById[currentEntry.itemId] : null;
  const canOfferHanziTyping = progress.settings.hanziTyping === null
    && progress.completedLessons.length >= 2
    && initialQueue.some((entry) => entry.skill === 'recall-hanzi'
      && (progress.cards[entry.cardId]?.correctStreak || 0) >= 2);

  // Flush pending card updates to real progress when leaving
  useEffect(() => {
    return () => {
      const updates = pendingCards.current;
      if (!Object.keys(updates).length) return;
      setProgress((currentProgress) => ({
        ...currentProgress,
        cards: { ...currentProgress.cards, ...updates },
      }));
    };
  }, []);

  useEffect(() => {
    if (initialQueue.length && !currentEntry) homeButtonRef.current?.focus();
  }, [initialQueue.length, currentEntry]);

  function chooseHanziTyping(enabled) {
    setTypingPromptHandled(true);
    if (enabled) {
      setQueue((currentQueue) => groupHanziTypingLast(currentQueue.map((entry) =>
        entry.skill === 'recall-hanzi' && (progress.cards[entry.cardId]?.correctStreak || 0) >= 2
          ? { ...entry, kind: 'type-hanzi' }
          : entry
      )));
    }
    setProgress((currentProgress) => ({
      ...currentProgress,
      settings: { ...currentProgress.settings, hanziTyping: enabled },
    }));
  }

  function answer(result) {
    if (!currentEntry || !currentItem) return;
    const oldCard = pendingCards.current[currentEntry.cardId] || progress.cards[currentEntry.cardId];
    const cardResult = result.correct && (currentEntry.attempts || 0) > 0 ? { ...result, hard: true } : result;
    const updated = updateCard(oldCard, cardResult);
    pendingCards.current[currentEntry.cardId] = updated;
    if (!result.correct && (currentEntry.attempts || 0) >= 1) {
      setDeferredCount((value) => value + 1);
    }
    setQueue((currentQueue) => answerReviewQueue(currentQueue, result));
    if ((currentEntry.attempts || 0) === 0 && result.correct) {
      setAnsweredCount((value) => value + 1);
    }
  }

  return html`
    <section class="screen lesson-screen">
      <div class="focus-top-row">
        <button class="brand-mark mini" onClick=${() => go('home')} aria-label="Hem"><img src="./assets/icons/icon.svg?v=84" alt="" /></button>
        <${Button} progress=${progress} labelKey="action.back" kind="ghost" onClick=${() => go('home')} />
        <span class="focus-spacer"></span>
        <span class="pill">${reviewProgressLabel(answeredCount, queue.length)}</span>
      </div>
      <h1><${UiText} progress=${progress} id="review.title" /></h1>

      ${canOfferHanziTyping && !typingPromptHandled ? html`
        <section class="exercise-card intro-card">
          <div class="eyebrow">Ny frågetyp</div>
          <h2>Skriv kinesiska</h2>
          <p>Skriv ordets pinyin med ett kinesiskt tangentbord och välj rätt kinesiska tecken. Exempel: skriv <strong>wo</strong> och välj <strong class="hanzi">我</strong>.</p>
          <p>Skrivfrågorna kommer sist i repetitionen, så att du slipper växla tangentbord mellan varje fråga. Du kan ändra valet senare i Inställningar.</p>
          <div class="settings-actions">
            <button class="button" onClick=${() => chooseHanziTyping(true)}>Aktivera</button>
            <button class="button secondary" onClick=${() => chooseHanziTyping(false)}>Inte nu</button>
          </div>
        </section>
      ` : !initialQueue.length ? html`
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
          <h2><${UiText} progress=${progress} id="review.complete" /></h2>
          <p>${deferredCount ? `${deferredCount} svåra kort kommer tillbaka senare.` : 'Bra jobbat. Om du missade något fick det komma tillbaka i samma runda.'}</p>
          <${Button} buttonRef=${homeButtonRef} progress=${progress} labelKey="nav.home" onClick=${() => go('home')} />
        </section>
      `}
    </section>
  `;
}
