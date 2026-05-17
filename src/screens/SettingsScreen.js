import { html } from '../html.js';
import { useRef, useState } from 'preact/hooks';
import { createDefaultProgress, makeBackup, parseBackup } from '../storage.js';
import { Button } from '../components/Button.js';
import { UiText } from '../components/UiText.js';

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
    link.download = `mandarinmode-backup-${new Date().toISOString().slice(0, 10)}.json`;
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
    if (confirm('Nollställa all progress på den här enheten?')) {
      setProgress(createDefaultProgress());
      setMessage('Progress nollställd.');
    }
  }

  return html`
    <section class="screen settings-screen">
      <${Button} progress=${progress} labelKey="action.back" kind="ghost" onClick=${() => go('home')} />
      <h1><${UiText} progress=${progress} id="settings.title" /></h1>

      <section class="panel">
        <h2><${UiText} progress=${progress} id="status.language" /></h2>
        <label><input type="radio" checked=${progress.settings.uiMode === 'sv'} onChange=${() => setMode('sv')} /> Svenska</label>
        <label><input type="radio" checked=${progress.settings.uiMode === 'gradual-assisted'} onChange=${() => setMode('gradual-assisted')} /> Gradvis kinesiska + svenska</label>
        <label><input type="radio" checked=${progress.settings.uiMode === 'gradual-hints'} onChange=${() => setMode('gradual-hints')} /> Gradvis kinesiska, hint vid tryck/hover</label>
        <label><input type="radio" checked=${progress.settings.uiMode === 'zh'} onChange=${() => setMode('zh')} /> Kinesiska för upplåsta ord</label>
      </section>

      <section class="panel">
        <h2>Data</h2>
        <p>Progress sparas i den här webbläsaren. Export/import skyddar vid byte av mobil, webbläsare eller host.</p>
        <div class="button-row">
          <${Button} progress=${progress} labelKey="action.export" onClick=${exportBackup} />
          <${Button} progress=${progress} labelKey="action.import" kind="secondary" onClick=${() => fileRef.current?.click()} />
          <input ref=${fileRef} type="file" accept="application/json" hidden onChange=${importBackup} />
        </div>
        <${Button} progress=${progress} labelKey="action.reset" kind="danger" onClick=${resetProgress} />
      </section>

      ${message ? html`<p class="notice">${message}</p>` : null}
    </section>
  `;
}
