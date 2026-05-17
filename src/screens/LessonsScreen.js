import { html } from '../html.js';
import { packs, lessonKey } from '../content/packs.js';
import { Button } from '../components/Button.js';

export function LessonsScreen({ progress, go }) {
  return html`
    <section class="screen lessons-screen">
      <${Button} progress=${progress} labelKey="action.back" kind="ghost" onClick=${() => go('home')} />
      <h1>Lektioner</h1>
      <p class="muted">Alla lektioner, grupperade per paket.</p>

      <div class="lesson-list all-lessons-list">
        ${packs.flatMap((pack) => pack.lessons.map((lesson, index) => {
          const key = lessonKey(pack.id, lesson.id);
          const done = progress.completedLessons.includes(key);
          const active = progress.activeSession?.type === 'lesson' && progress.activeSession.packId === pack.id && progress.activeSession.lessonId === lesson.id;
          return html`
            <article class=${`lesson-row ${done ? 'done' : ''}`} key=${key}>
              <div class="lesson-number">${index + 1}</div>
              <div>
                <h3>${lesson.titleSv}</h3>
                <p>${pack.titleSv} · ${lesson.descriptionSv}</p>
              </div>
              <div class="lesson-row-actions">
                ${active ? html`<span class="status-chip learning">Pågående</span>` : done ? html`<span class="status-chip strong">Klar</span>` : html`<span class="status-chip weak">Ej klar</span>`}
                <button class="button secondary" onClick=${() => go('lesson', { packId: pack.id, lessonId: lesson.id })}>
                  ${active ? 'Fortsätt' : done ? 'Öva igen' : 'Starta'}
                </button>
              </div>
            </article>
          `;
        }))}
      </div>
    </section>
  `;
}
