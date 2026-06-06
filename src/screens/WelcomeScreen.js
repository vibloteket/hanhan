import { html } from '../html.js';

export function WelcomeScreen({ go }) {
  return html`
    <section class="screen welcome-screen">
      <div class="welcome-card">
        <div class="welcome-icon">
          <img src="./assets/icons/icon-large.svg?v=48" alt="" width="120" height="120" />
        </div>
        <h1>HànHàn</h1>
        <p class="welcome-subtitle">Lär dig mandarin från svenska — steg för steg, utan stress.</p>

        <div class="welcome-features">
          <div class="welcome-feature">
            <strong>Kinesiskt gränssnitt</strong>
            <span>Appens knappar och texter byts gradvis till kinesiska allt eftersom du lär dig orden.</span>
          </div>
          <div class="welcome-feature">
            <strong>Ingen inloggning</strong>
            <span>All data sparas lokalt i din webbläsare. Inga konton, inga servrar.</span>
          </div>
          <div class="welcome-feature">
            <strong>Repetition</strong>
            <span>Ord du pluggar kommer tillbaka för repetition när det är dags, med stöd för pinyin- och tecken-övningar.</span>
          </div>
        </div>

        <div class="welcome-actions">
          <button class="button primary" onClick=${() => go('home')}>Kom igång</button>
          <p class="welcome-hint">
            Du kan alltid läsa mer på <a href="./about.html">Om HànHàn</a>.
          </p>
        </div>
      </div>
    </section>
  `;
}