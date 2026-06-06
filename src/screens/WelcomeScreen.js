import { html } from '../html.js';

export function WelcomeScreen({ go }) {
  return html`
    <section class="hero screen">
      <div class="hero-title">
        <p class="eyebrow">Praktisk mandarin från svenska</p>
        <h1>HànHàn</h1>
        <p>En liten webbapp för att lära sig vardagsmandarin, app-ord och pinyin — med ett gränssnitt som gradvis växlar till kinesiska.</p>
      </div>
      <div class="hero-actions">
        <button class="button" onClick=${() => go('home')}>Kom igång</button>
      </div>
    </section>

    <section class="screen panel">
      <h2>Vad är det?</h2>
      <p>HànHàn är en statisk webbapp för att lära sig mandarin från svenska. Den börjar med appens egna UI-ord, lär ut tecken och pinyin stegvis, och använder repetition för att hjälpa orden fastna.</p>
    </section>

    <section class="screen stats-grid" aria-label="Fokusområden">
      <div class="stat-card"><strong>UI</strong><span>knappar, menyer och apptexter</span></div>
      <div class="stat-card"><strong>Vardag</strong><span>hemma, familj och enkla fraser</span></div>
      <div class="stat-card"><strong>SRS</strong><span>repetition när kort är redo</span></div>
    </section>

    <section class="screen panel">
      <h2>Inga konton, ingen inloggning</h2>
      <p>Din data sparas lokalt i webbläsaren. Inga servrar, inga konton. I inställningarna kan du exportera och importera backup.</p>
    </section>
  `;
}