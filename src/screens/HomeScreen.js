import { html } from '../html.js';
import { packs, findNextLesson, allItems, getLesson } from '../content/packs.js';
import { dueCards } from '../srs.js';
import { Button } from '../components/Button.js';
import { UiText } from '../components/UiText.js';

export function HomeScreen({ progress, setProgress, go }) {
  const activeLesson = progress.activeSession?.type === 'lesson'
    ? getLesson(progress.activeSession.packId, progress.activeSession.lessonId)
    : null;
  const next = activeLesson
    ? { packId: progress.activeSession.packId, lessonId: progress.activeSession.lessonId }
    : findNextLesson(progress);
  const dueCount = dueCards(progress, allItems).length;
  const shouldReviewNext = !activeLesson && dueCount > 0;
  const completedCount = progress.completedLessons.length;

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
            <${Button} progress=${progress} kind="secondary" onClick=${() => go('lesson', next)}>Nästa lektion</${Button}>
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
          <button class="link-button danger-link" onClick=${cancelActiveLesson}>Avbryt</button>
        </div>
      </section>
    ` : null}

    <section class="stats-grid">
      <div class="stat-card"><strong>${dueCount}</strong><span>kort att repetera</span></div>
      <div class="stat-card"><strong>${completedCount}</strong><span>klara lektioner</span></div>
      <button class="stat-card clickable" onClick=${() => go('progress')}>
        <strong>${Object.keys(progress.cards).length}</strong><span>inlärda kort</span>
      </button>
    </section>

    <section class="screen">
      <h2><${UiText} progress=${progress} id="nav.packs" /></h2>
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
  `;
}
