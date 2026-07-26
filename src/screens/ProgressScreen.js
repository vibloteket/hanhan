import { html } from '../html.js';
import { useState } from 'preact/hooks';
import { allItems, packById } from '../content/packs.js';
import { Button } from '../components/Button.js';
import { UiText } from '../components/UiText.js';
import { isMasteredCard, MASTERED_STREAK } from '../mastery.js';
import { cardId, REVIEW_SKILLS } from '../srs.js';

function cardStatus(card) {
  if (!card) return { label: 'Inte startad', className: 'not-started' };
  const due = new Date(card.dueAt).getTime() <= Date.now();
  if (due) return { label: 'Dags att repetera', key: 'status.due', className: 'due' };
  if (isMasteredCard(card)) return { label: 'Sitter', key: 'status.mastered', className: 'mastered' };
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

function normalizeSearch(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function searchableText({ item, status }) {
  return normalizeSearch([
    item.sv,
    item.hanzi,
    item.pinyin,
    packById[item.packId]?.titleSv,
    item.lessonTitleSv,
    status.label,
  ].join(' '));
}

export function ProgressScreen({ progress, go }) {
  const [query, setQuery] = useState('');
  const learnedItems = allItems
    .map((item) => {
      const skills = REVIEW_SKILLS
        .map((skill) => {
          const card = progress.cards[cardId(item.id, skill.id)];
          return card ? { ...skill, card, status: cardStatus(card) } : null;
        })
        .filter(Boolean);
      const card = skills.map((entry) => entry.card).sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt))[0];
      return card ? { item, card, skills, status: cardStatus(card) } : null;
    })
    .filter(Boolean)
    .sort((a, b) => {
      const dueDiff = new Date(a.card.dueAt).getTime() - new Date(b.card.dueAt).getTime();
      if (dueDiff) return dueDiff;
      return a.item.packId.localeCompare(b.item.packId) || a.item.hanzi.localeCompare(b.item.hanzi);
    });

  const skillCards = learnedItems.flatMap(({ skills }) => skills);
  const dueCount = skillCards.filter(({ status }) => status.className === 'due').length;
  const masteredCount = skillCards.filter(({ status }) => status.className === 'mastered').length;
  const normalizedQuery = normalizeSearch(query);
  const visibleItems = normalizedQuery
    ? learnedItems.filter((entry) => searchableText(entry).includes(normalizedQuery))
    : learnedItems;

  return html`
    <section class="screen progress-screen">
      <${Button} progress=${progress} labelKey="action.back" kind="ghost" onClick=${() => go('home')} />
      <h1><${UiText} progress=${progress} id="nav.progress" /></h1>
      <p class="muted">Alla ord och fraser som du har låst upp genom lektioner.</p>

      <section class="summary-grid" aria-label="Sammanfattning">
        <div class="summary-card"><strong>${learnedItems.length}</strong><span><${UiText} progress=${progress} id="status.learnedCards" /></span></div>
        <div class="summary-card"><strong>${dueCount}</strong><span>dags att repetera</span></div>
        <div class="summary-card"><strong>${masteredCount}</strong><span><${UiText} progress=${progress} id="status.mastered" /> (<${UiText} progress=${progress} id="status.correctStreak" values=${{ count: `${MASTERED_STREAK}+` }} />)</span></div>
      </section>

      ${learnedItems.length ? html`
        <label class="search-box">
          <span>Sök i ordlistan</span>
          <input
            type="search"
            value=${query}
            onInput=${(event) => setQuery(event.currentTarget.value)}
            placeholder="Sök svenska, 汉字 eller pinyin"
            autocomplete="off"
          />
        </label>

        ${normalizedQuery ? html`<p class="muted small search-count">${visibleItems.length} av ${learnedItems.length} kort matchar.</p>` : null}

        ${visibleItems.length ? html`
        <div class="learned-list">
          ${visibleItems.map(({ item, skills }) => {
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
                ${skills.map(({ id, label, card, status }) => html`
                  <div key=${id}>
                    <span class=${`status-chip ${status.className}`}>${label}: ${status.key ? html`<${UiText} progress=${progress} id=${status.key} />` : status.label}</span>
                    <span class="muted small"> · <${UiText} progress=${progress} id="action.next" />: ${formatDue(card)} · <${UiText} progress=${progress} id="status.correctStreak" values=${{ count: card.correctStreak || 0 }} /></span>
                  </div>
                `)}
              </div>
            </article>
          `})}
        </div>
        ` : html`
          <section class="panel empty-state">
            <h2>Inga träffar</h2>
            <p>Testa att söka på svenska, kinesiska tecken eller pinyin.</p>
          </section>
        `}
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
