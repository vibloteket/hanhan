import { html } from '../html.js';
import { useRef, useState } from 'preact/hooks';
import { createDefaultProgress, makeBackup, parseBackup } from '../storage.js';
import { Button } from '../components/Button.js';
import { UiText } from '../components/UiText.js';
import { APP_LICENSE, APP_VERSION, ASSET_VERSION, BUILD_COMMIT, BUILD_DATE, CONTACT_EMAIL } from '../buildInfo.js';

export function SettingsScreen({ progress, setProgress, go }) {
  const fileRef = useRef(null);
  const [message, setMessage] = useState('');

  function setMode(uiMode) {
    setProgress((current) => ({ ...current, settings: { ...current.settings, uiMode } }));
  }

  function exportBackup() {
    const blob = new Blob([JSON.stringify(makeBackup(progress), null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `hanhan-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setMessage('Backup exporterad.');
  }

  async function importBackup(event) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      setProgress(parseBackup(text));
      setMessage('Backup importerad.');
    } catch (error) {
      setMessage(error.message || 'Import misslyckades.');
    } finally {
      event.currentTarget.value = '';
    }
  }

  function resetProgress() {
    if (confirm('Nollställa all inlärningsdata på den här enheten?')) {
      setProgress(createDefaultProgress());
      setMessage('Inlärningsdata nollställd.');
    }
  }

  return html`
    <section class="screen settings-screen">
      <${Button} progress=${progress} labelKey="action.back" kind="ghost" onClick=${() => go('home')} />
      <h1><${UiText} progress=${progress} id="settings.title" /></h1>

      <section class="screen panel">
        <h2><${UiText} progress=${progress} id="status.language" /></h2>
        <label><input type="radio" checked=${progress.settings.uiMode === 'dynamic'} onChange=${() => setMode('dynamic')} /> Dynamiskt: svenska → kinesiska + svenska → kinesiska när ordet sitter</label>
        <label><input type="radio" checked=${progress.settings.uiMode === 'sv'} onChange=${() => setMode('sv')} /> Svenska</label>
        <label><input type="radio" checked=${progress.settings.uiMode === 'zh'} onChange=${() => setMode('zh')} /> Kinesiska för upplåsta ord</label>
        <label><input type="radio" checked=${progress.settings.uiMode === 'zh-all'} onChange=${() => setMode('zh-all')} /> Debug: kinesiska för alla UI-ord</label>
      </section>

      <section class="screen panel">
        <h2><${UiText} progress=${progress} id="section.data" /></h2>
        <p>Din inlärningsdata sparas i den här webbläsaren. Export/import skyddar vid byte av mobil, webbläsare eller host.</p>
        <div class="settings-actions">
          <${Button} progress=${progress} labelKey="action.export" onClick=${exportBackup} />
          <${Button} progress=${progress} labelKey="action.import" kind="secondary" onClick=${() => fileRef.current?.click()} />
          <input ref=${fileRef} type="file" accept="application/json" hidden onChange=${importBackup} />
          <${Button} progress=${progress} labelKey="action.reset" kind="danger" onClick=${resetProgress} />
        </div>
      </section>

      <section class="screen panel about-panel">
        <h2><${UiText} progress=${progress} id="section.licenseContact" /></h2>
        <dl class="about-list">
          <div><dt><${UiText} progress=${progress} id="term.version" /></dt><dd>${APP_VERSION}</dd></div>
          <div><dt><${UiText} progress=${progress} id="term.build" /></dt><dd>${BUILD_COMMIT}</dd></div>
          <div><dt><${UiText} progress=${progress} id="term.buildDate" /></dt><dd>${BUILD_DATE}</dd></div>
          <div><dt><${UiText} progress=${progress} id="term.assetVersion" /></dt><dd>${ASSET_VERSION}</dd></div>
          <div><dt><${UiText} progress=${progress} id="term.license" /></dt><dd><a href="./LICENSE.txt">${APP_LICENSE}</a></dd></div>
          <div><dt><${UiText} progress=${progress} id="term.contact" /></dt><dd><a href=${`mailto:${CONTACT_EMAIL}`}>${CONTACT_EMAIL}</a></dd></div>
        </dl>
      </section>

      ${message ? html`<p class="notice">${message}</p>` : null}
    </section>
  `;
}
