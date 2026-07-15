import { html } from '../html.js';
import { packs, findNextLesson, allItems, getLesson } from '../content/packs.js';
import { createReviewQueue } from '../reviewQueue.js';
import { Button } from '../components/Button.js';
import { UiText } from '../components/UiText.js';

export function HomeScreen({ progress, setProgress, go }) {
  const activeLesson = progress.activeSession?.type === 'lesson'
    ? getLesson(progress.activeSession.packId, progress.activeSession.lessonId)
    : null;
  const next = activeLesson
    ? { packId: progress.activeSession.packId, lessonId: progress.activeSession.lessonId }
    : findNextLesson(progress);
  const dueCount = createReviewQueue(progress, allItems).length;
  const shouldReviewNext = !activeLesson && dueCount > 0;
  const completedCount = progress.completedLessons.length;
  const learnedItemCount = new Set(Object.values(progress.cards).map((card) => card.itemId)).size;

  function cancelActiveLesson() {
    if (!confirm('Avbryta pågående lektion? Tidigare klara lektioner påverkas inte.')) return;
    setProgress((currentProgress) => ({ ...currentProgress, activeSession: null }));
  }

  return html`
    <section class="hero screen">
      <div class="hero-title">
        <h1><${UiText} progress=${progress} id="app.title" /></h1>
        <p>Byggt för svensk → mandarin, med gradvis kinesiskt gränssnitt.</p>
      </div>
      <div class="hero-actions">
        ${activeLesson ? html`
          <${Button} progress=${progress} labelKey="action.continue" onClick=${() => go('lesson', next)} />
          <${Button} progress=${progress} labelKey="action.review" kind="secondary" onClick=${() => go('review')} />
        ` : shouldReviewNext ? html`
          <${Button} progress=${progress} labelKey="action.review" onClick=${() => go('review')} />
          ${next ? html`
            <button class="button secondary" onClick=${() => go('lesson', next)}>
              <span class="inline-label-combo"><${UiText} progress=${progress} id="action.next" /><span aria-hidden="true">·</span><${UiText} progress=${progress} id="lesson.title" /></span>
            </button>
          ` : null}
        ` : next ? html`
          <${Button} progress=${progress} labelKey=${completedCount ? 'action.continue' : 'action.start'} onClick=${() => go('lesson', next)} />
          <${Button} progress=${progress} labelKey="action.review" kind="secondary" onClick=${() => go('review')} />
        ` : html`
          <${Button} progress=${progress} labelKey="action.review" onClick=${() => go('review')} />
        `}
      </div>
    </section>

    ${activeLesson ? html`
      <section class="screen panel ongoing-session">
        <div>
          <h2>Pågående session</h2>
          <p>Du är mitt i lektionen <strong>${activeLesson.titleSv}</strong>. Steg ${progress.activeSession.index + 1}.</p>
        </div>
        <div class="session-actions">
          <${Button} progress=${progress} labelKey="action.continue" onClick=${() => go('lesson', next)} />
          <button class="link-button danger-link" onClick=${cancelActiveLesson}><${UiText} progress=${progress} id="action.cancel" /></button>
        </div>
      </section>
    ` : null}

    <section class="stats-grid">
      <button class="stat-card clickable" onClick=${() => go('review')}>
        <strong>${dueCount}</strong><span><${UiText} progress=${progress} id="status.due" /></span>
      </button>
      <button class="stat-card clickable" onClick=${() => go('lessons')}>
        <strong>${completedCount}</strong><span><${UiText} progress=${progress} id="lesson.complete" /> · <${UiText} progress=${progress} id="lesson.title" /></span>
      </button>
      <button class="stat-card clickable" onClick=${() => go('progress')}>
        <strong>${learnedItemCount}</strong><span><${UiText} progress=${progress} id="status.learnedCards" /></span>
      </button>
    </section>

    <section class="screen">
      <h2><${UiText} progress=${progress} id="action.learn" /></h2>
      <div class="pack-list">
        ${packs.map((pack) => {
          const completed = pack.lessons.filter((lesson) => progress.completedLessons.includes(`${pack.id}/${lesson.id}`)).length;
          return html`
            <article class="pack-card" key=${pack.id} onClick=${() => go('pack', { packId: pack.id })}>
              <div>
                <h3>${pack.titleSv}</h3>
                <p>${pack.descriptionSv}</p>
              </div>
              <span class="pill">${completed}/${pack.lessons.length}</span>
            </article>
          `;
        })}
      </div>
    </section>

    <section class="screen nav-grid">
      <button class="stat-card clickable" onClick=${() => go('settings')}>
        <strong><${UiText} progress=${progress} id="settings.title" /></strong>
        <span>Språk, backup, import/export</span>
      </button>
      <button class="stat-card clickable" onClick=${() => go('about')}>
        <strong><${UiText} progress=${progress} id="nav.about" /></strong>
        <span>Fokus, integritet, kontakt</span>
      </button>
    </section>
  `;
}
