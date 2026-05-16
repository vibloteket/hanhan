import { html } from '../html.js';
import { packById, lessonKey } from '../content/packs.js';
import { Button } from '../components/Button.js';

export function PackScreen({ progress, route, go }) {
  const pack = packById[route.packId];
  if (!pack) return html`<section class="screen"><p>Paketet hittades inte.</p></section>`;

  return html`
    <section class="screen">
      <${Button} progress=${progress} labelKey="action.back" kind="ghost" onClick=${() => go('home')} />
      <h1>${pack.titleSv}</h1>
      <p>${pack.descriptionSv}</p>
      <div class="lesson-list">
        ${pack.lessons.map((lesson, index) => {
          const done = progress.completedLessons.includes(lessonKey(pack.id, lesson.id));
          return html`
            <article class=${`lesson-row ${done ? 'done' : ''}`} key=${lesson.id}>
              <div class="lesson-number">${index + 1}</div>
              <div>
                <h3>${lesson.titleSv}</h3>
                <p>${lesson.descriptionSv}</p>
              </div>
              <button class="button secondary" onClick=${() => go('lesson', { packId: pack.id, lessonId: lesson.id })}>
                ${done ? 'Öva igen' : 'Starta'}
              </button>
            </article>
          `;
        })}
      </div>
    </section>
  `;
}
