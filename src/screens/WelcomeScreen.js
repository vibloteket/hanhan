import { html } from '../html.js';
import { APP_LICENSE, CONTACT_EMAIL, SOURCE_URL } from '../buildInfo.js';

export function WelcomeScreen({ go, showAppLink }) {
  return html`
    <section class="hero screen">
      <div class="hero-title">
        <div class="welcome-icon">
          <img src="./assets/icons/icon-large.svg?v=74" alt="" width="96" height="96" />
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
      <h2>Varför HànHàn?</h2>
      <p>
      Jag, Victor 'viblo' Blomqvist, skapade HànHàn för att motivera mig att bli bättre på kinesiska. Jag har tidigare bott och jobbat i Kina, har en kinesisk fru och besöker ibland Kina. 
      Trots detta (eller kanske tack vare), är min kinesiska inget att hänga i julgranen. Förhoppningen är att detta ska ändras med HànHàn! </p><p>
      HànHàn är 'opinionated', mitt mål är inte att skapa en generisk flash-card app, utan en webapp anpassad för kinesiska (både pinyin och tecken tex), och med lektioner som jag själv upplever är viktiga.  
      I det moderna Kina sker väldigt mycket genom mobilen, och även om tex Wechat/微信 har ett engelskt UI, räcker det inte långt. Skanna en QR-kod på en restaurang och ingen engelska är längre i sikte. 
      Därför börjar HànHàn med att lära ut sitt eget UI.
      </p>
      <p>Även om jag byggt HànHàn främst för att lära mig själv, hoppas jag att den även är användbar för dig!</p>
      <p><i>Victor - 2026-07-26</i></p>
    </section>


    <section class="screen panel">
      <h2>Öppen källkod</h2>
      <p>HànHàn är fri programvara med öppen källkod och licensieras under ${APP_LICENSE}. Du kan läsa koden, rapportera problem och bidra på GitHub.</p>
      <p><a class="button secondary" href=${SOURCE_URL} target="_blank" rel="noopener noreferrer">Källkod på GitHub</a></p>
    </section>

    <section class="screen panel">
      <h2>Kontakt</h2>
      <p>Har du feedback, förslag eller buggrapporter? Hör av dig till <a href=${`mailto:${CONTACT_EMAIL}`}>${CONTACT_EMAIL}</a>.</p>
    </section>
  `;
}
