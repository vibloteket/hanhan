import { html } from '../html.js';
import { useState } from 'preact/hooks';
import { allItems, packById } from '../content/packs.js';
import { Button } from '../components/Button.js';
import { UiText } from '../components/UiText.js';
import { isMasteredCard, MASTERED_STREAK } from '../mastery.js';
import { cardId, REVIEW_SKILLS } from '../srs.js';
import { formatUiDate } from '../dateFormat.js';
import { DEFAULT_WORD_LIST_SORT, sortWordList, WORD_LIST_SORTS } from '../wordList.js';

function cardStatus(card) {
  if (!card) return { label: 'Inte startad', className: 'not-started' };
  const due = new Date(card.dueAt).getTime() <= Date.now();
  if (due) return { label: 'Dags att repetera', key: 'status.due', className: 'due' };
  if (isMasteredCard(card)) return { label: 'Sitter', key: 'status.mastered', className: 'mastered' };
  if ((card.correctStreak || 0) >= 3 || (card.intervalDays || 0) >= 3) return { label: 'Stark', key: 'status.strong', className: 'strong' };
  if ((card.correctStreak || 0) >= 1) return { label: 'På gång', key: 'status.inProgress', className: 'learning' };
  return { label: 'Ny / svag', key: 'status.newWeak', className: 'weak' };
}

function formatDue(card, progress) {
  if (!card?.dueAt) return '—';
  const due = new Date(card.dueAt);
  if (due.getTime() <= Date.now()) return null;
  return formatUiDate(due, progress, { timeOnlyToday: true });
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

export function ProgressScreen({ progress, setProgress, go }) {
  const [query, setQuery] = useState('');
  const sortId = progress.settings?.wordListSort || DEFAULT_WORD_LIST_SORT;
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
    .filter(Boolean);

  const skillCards = learnedItems.flatMap(({ skills }) => skills);
  const dueCount = skillCards.filter(({ status }) => status.className === 'due').length;
  const masteredCount = skillCards.filter(({ status }) => status.className === 'mastered').length;
  const normalizedQuery = normalizeSearch(query);
  const matchingItems = normalizedQuery
    ? learnedItems.filter((entry) => searchableText(entry).includes(normalizedQuery))
    : learnedItems;
  const visibleItems = sortWordList(matchingItems, sortId, progress);

  function changeSort(event) {
    const wordListSort = event.currentTarget.value;
    setProgress((current) => ({
      ...current,
      settings: { ...current.settings, wordListSort },
    }));
  }

  return html`
    <section class="screen progress-screen">
      <${Button} progress=${progress} labelKey="action.back" kind="ghost" onClick=${() => go('home')} />
      <h1><${UiText} progress=${progress} id="nav.progress" /></h1>
      <p class="muted">Alla ord och fraser som du har låst upp genom lektioner.</p>

      <section class="summary-grid" aria-label="Sammanfattning">
        <div class="summary-card"><strong>${learnedItems.length}</strong><span><${UiText} progress=${progress} id="status.learnedCards" /></span></div>
        <div class="summary-card"><strong>${dueCount}</strong><span><${UiText} progress=${progress} id="status.due" /></span></div>
        <div class="summary-card"><strong>${masteredCount}</strong><span><${UiText} progress=${progress} id="status.mastered" /> (<${UiText} progress=${progress} id="status.correctStreak" values=${{ count: `${MASTERED_STREAK}+` }} />)</span></div>
      </section>

      ${learnedItems.length ? html`
        <div class="word-list-controls">
          <label class="search-box">
            <span><${UiText} progress=${progress} id="action.searchWordList" /></span>
            <input
              type="search"
              value=${query}
              onInput=${(event) => setQuery(event.currentTarget.value)}
              placeholder="Sök svenska, 汉字 eller pinyin"
              autocomplete="off"
            />
          </label>
          <label class="sort-box">
            <span>Sortera</span>
            <select value=${sortId} onChange=${changeSort}>
              ${WORD_LIST_SORTS.map(({ id, label }) => html`<option value=${id}>${label}</option>`)}
            </select>
          </label>
        </div>

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
                ${skills.map(({ id, label, labelKey, card, status }) => {
                  const due = formatDue(card, progress);
                  return html`
                  <div key=${id}>
                    <span class=${`status-chip ${status.className}`}><${UiText} progress=${progress} id=${labelKey} />: ${status.key ? html`<${UiText} progress=${progress} id=${status.key} />` : status.label}</span>
                    <span class="muted small"> · <${UiText} progress=${progress} id="action.next" />: ${due ?? html`<${UiText} progress=${progress} id="status.now" />`} · <${UiText} progress=${progress} id="status.correctStreak" values=${{ count: card.correctStreak || 0 }} /></span>
                  </div>
                `})}
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
