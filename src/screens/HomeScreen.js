import { html } from '../html.js';
import { packs, findNextLesson, allItems } from '../content/packs.js';
import { dueCards } from '../srs.js';
import { Button } from '../components/Button.js';
import { UiText } from '../components/UiText.js';

export function HomeScreen({ progress, go }) {
  const next = findNextLesson(progress);
  const dueCount = dueCards(progress, allItems).length;
  const completedCount = progress.completedLessons.length;

  return html`
    <section class="hero screen">
      <div class="hero-title">
        <h1><${UiText} progress=${progress} id="app.title" /></h1>
        <p>Byggt för svensk → mandarin, med gradvis kinesiskt gränssnitt.</p>
      </div>
      <div class="hero-actions">
        ${next ? html`
          <${Button} progress=${progress} labelKey=${completedCount ? 'action.continue' : 'action.start'} onClick=${() => go('lesson', next)} />
        ` : html`<${Button} progress=${progress} labelKey="action.review" onClick=${() => go('review')} />`}
        <${Button} progress=${progress} labelKey="action.review" kind="secondary" onClick=${() => go('review')} />
      </div>
    </section>

    <section class="stats-grid">
      <div class="stat-card"><strong>${dueCount}</strong><span>kort att repetera</span></div>
      <div class="stat-card"><strong>${completedCount}</strong><span>klara lektioner</span></div>
      <div class="stat-card"><strong>${Object.keys(progress.cards).length}</strong><span>inlärda kort</span></div>
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
