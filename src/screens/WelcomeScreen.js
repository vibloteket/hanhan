import { html } from '../html.js';
import { CONTACT_EMAIL } from '../buildInfo.js';

export function WelcomeScreen({ go, showAppLink }) {
  return html`
    <section class="hero screen">
      <div class="hero-title">
        <div class="welcome-icon">
          <img src="./assets/icons/icon-large.svg?v=68" alt="" width="96" height="96" />
        </div>
        <p class="eyebrow">Praktisk mandarin från svenska</p>
        <h1>HànHàn</h1>
        <p>En liten webbapp för att lära sig vardagsmandarin, app-ord och pinyin — med ett gränssnitt som gradvis växlar till kinesiska.</p>
      </div>
      ${showAppLink ? html`
        <div class="hero-actions">
          <button class="button" onClick=${() => go('home')}>Tillbaka till appen</button>
        </div>
      ` : html`
        <div class="hero-actions">
          <button class="button" onClick=${() => go('home')}>Kom igång</button>
        </div>
      `}
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

    <section class="screen panel">
      <h2>Kontakt</h2>
      <p>Har du feedback, förslag eller buggrapporter? Hör av dig till <a href=${`mailto:${CONTACT_EMAIL}`}>${CONTACT_EMAIL}</a>.</p>
    </section>
  `;
}