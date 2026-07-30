import { html } from '../html.js';
import { lessonNeedsUpdate, packs, lessonKey } from '../content/packs.js';
import { Button } from '../components/Button.js';
import { UiText } from '../components/UiText.js';
import { formatUiDate } from '../dateFormat.js';

export function LessonsScreen({ progress, go }) {
  return html`
    <section class="screen lessons-screen">
      <${Button} progress=${progress} labelKey="action.back" kind="ghost" onClick=${() => go('home')} />
      <h1><${UiText} progress=${progress} id="lesson.title" /></h1>
      <p class="muted">Alla lektioner, grupperade per paket.</p>

      <div class="lesson-list all-lessons-list">
        ${packs.flatMap((pack) => pack.lessons.map((lesson, index) => {
          const key = lessonKey(pack.id, lesson.id);
          const done = progress.completedLessons.includes(key);
          const needsUpdate = lessonNeedsUpdate(progress, { ...lesson, packId: pack.id });
          const active = progress.activeSession?.type === 'lesson' && progress.activeSession.packId === pack.id && progress.activeSession.lessonId === lesson.id;
          const completedAt = formatUiDate(progress.lessonMeta?.[key]?.completedAt, progress, { includeTime: true });
          const startedAt = active ? formatUiDate(progress.activeSession?.startedAt, progress, { includeTime: true }) : '';
          return html`
            <article class=${`lesson-row ${done ? 'done' : ''}`} key=${key}>
              <div class="lesson-number">${index + 1}</div>
              <div>
                <h3>${lesson.titleSv}</h3>
                <p>${pack.titleSv} · ${lesson.descriptionSv}</p>
                ${active && startedAt ? html`<div class="muted small lesson-date">Startad: ${startedAt}</div>` : null}
                ${done && completedAt ? html`<div class="muted small lesson-date"><${UiText} progress=${progress} id="lesson.complete" />: ${completedAt}</div>` : null}
              </div>
              <div class="lesson-row-actions">
                ${active ? html`<span class="status-chip learning"><${UiText} progress=${progress} id="status.inProgress" /></span>` : needsUpdate ? html`<span class="status-chip due">Uppdaterad</span>` : done ? html`<span class="status-chip strong"><${UiText} progress=${progress} id="lesson.complete" /></span>` : html`<span class="status-chip weak"><${UiText} progress=${progress} id="status.incomplete" /></span>`}
                <button class="button secondary" onClick=${() => go('lesson', { packId: pack.id, lessonId: lesson.id })}>
                  ${active ? html`<${UiText} progress=${progress} id="action.continue" />` : needsUpdate ? html`<${UiText} progress=${progress} id="action.update" />` : done ? html`<${UiText} progress=${progress} id="action.practice" />` : html`<${UiText} progress=${progress} id="action.start" />`}
                </button>
              </div>
            </article>
          `;
        }))}
      </div>
    </section>
  `;
}
