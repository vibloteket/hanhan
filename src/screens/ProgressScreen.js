import { html } from '../html.js';
import { allItems, packById } from '../content/packs.js';
import { Button } from '../components/Button.js';
import { UiText } from '../components/UiText.js';

function cardStatus(card) {
  if (!card) return { label: 'Inte startad', className: 'not-started' };
  const due = new Date(card.dueAt).getTime() <= Date.now();
  if (due) return { label: 'Dags att repetera', className: 'due' };
  if ((card.correctStreak || 0) >= 3 || (card.intervalDays || 0) >= 3) return { label: 'Stark', className: 'strong' };
  if ((card.correctStreak || 0) >= 1) return { label: 'På gång', className: 'learning' };
  return { label: 'Ny / svag', className: 'weak' };
}

function formatDue(card) {
  if (!card?.dueAt) return '—';
  const due = new Date(card.dueAt);
  const now = new Date();
  if (due.getTime() <= now.getTime()) return 'Nu';
  const sameDay = due.toDateString() === now.toDateString();
  if (sameDay) return due.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
  return due.toLocaleDateString('sv-SE', { month: 'short', day: 'numeric' });
}

export function ProgressScreen({ progress, go }) {
  const learnedItems = allItems
    .filter((item) => progress.cards[item.id])
    .map((item) => ({ item, card: progress.cards[item.id], status: cardStatus(progress.cards[item.id]) }))
    .sort((a, b) => {
      const dueDiff = new Date(a.card.dueAt).getTime() - new Date(b.card.dueAt).getTime();
      if (dueDiff) return dueDiff;
      return a.item.packId.localeCompare(b.item.packId) || a.item.hanzi.localeCompare(b.item.hanzi);
    });

  const dueCount = learnedItems.filter(({ status }) => status.className === 'due').length;
  const strongCount = learnedItems.filter(({ status }) => status.className === 'strong').length;

  return html`
    <section class="screen progress-screen">
      <${Button} progress=${progress} labelKey="action.back" kind="ghost" onClick=${() => go('home')} />
      <h1><${UiText} progress=${progress} id="nav.progress" /></h1>
      <p class="muted">Alla ord och fraser som du har låst upp genom lektioner.</p>

      <section class="summary-grid" aria-label="Sammanfattning">
        <div class="summary-card"><strong>${learnedItems.length}</strong><span>lärda kort</span></div>
        <div class="summary-card"><strong>${dueCount}</strong><span>dags att repetera</span></div>
        <div class="summary-card"><strong>${strongCount}</strong><span>starka kort</span></div>
      </section>

      ${learnedItems.length ? html`
        <div class="learned-list">
          ${learnedItems.map(({ item, card, status }) => {
            const hanziLength = Array.from(item.hanzi).length;
            return html`
            <article class="learned-card" key=${item.id}>
              <div class="learned-main">
                <div class=${`hanzi learned-hanzi ${hanziLength >= 4 ? 'phrase' : hanziLength >= 3 ? 'long' : ''}`}>${item.hanzi}</div>
                <div class="learned-copy">
                  <strong>${item.sv}</strong>
                  <div class="pinyin small">${item.pinyin}</div>
                  <div class="muted small">${packById[item.packId]?.titleSv || item.packId} · ${item.lessonTitleSv}</div>
                </div>
              </div>
              <div class="learned-meta">
                <span class=${`status-chip ${status.className}`}>${status.label}</span>
                <span class="muted small">Nästa: ${formatDue(card)}</span>
                <span class="muted small">Rätt i rad: ${card.correctStreak || 0}</span>
              </div>
            </article>
          `})}
        </div>
      ` : html`
        <section class="panel empty-state">
          <h2>Inga lärda kort än</h2>
          <p>Gör första lektionen så dyker orden upp här.</p>
          <${Button} progress=${progress} labelKey="action.start" onClick=${() => go('home')} />
        </section>
      `}
    </section>
  `;
}
