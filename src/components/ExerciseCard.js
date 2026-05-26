import { html } from '../html.js';
import { useState } from 'preact/hooks';
import { Button } from './Button.js';
import { pickChoices } from '../exercises.js';
import { isCorrectHanzi, isCorrectPinyin } from '../textUtils.js';

export function ExerciseCard({ progress, step, onAnswer, onIntroDone }) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const item = step.item;
  const hanziLength = Array.from(item.hanzi || '').length;
  const hanziSizeClass = hanziLength >= 4 ? 'phrase' : hanziLength >= 3 ? 'long' : '';

  function finish(correct, mode, given = input) {
    setResult({ correct, mode, given });
  }

  function next() {
    const payload = result || { correct: true, mode: 'intro' };
    setInput('');
    setResult(null);
    if (step.kind === 'intro') onIntroDone?.();
    else onAnswer(payload);
  }

  if (step.kind === 'intro') {
    return html`
      <section class="exercise-card intro-card">
        <div class="eyebrow">Nytt ord</div>
        <div class=${`hanzi big ${hanziSizeClass}`}>${item.hanzi}</div>
        <div class="pinyin">${item.pinyin}</div>
        <h2>${item.sv}</h2>
        ${item.notesSv ? html`<p>${item.notesSv}</p>` : null}
        ${item.components?.length ? html`
          <div class="component-list" aria-label="Beståndsdelar">
            ${item.components.map((part) => html`
              <div class="component-part" key=${`${item.id}-${part.hanzi}`}>
                <span class="hanzi component-hanzi">${part.hanzi}</span>
                <span><strong>${part.pinyin}</strong> · ${part.sv}</span>
              </div>
            `)}
          </div>
        ` : null}
        <${Button} progress=${progress} labelKey="action.next" onClick=${next} />
      </section>
    `;
  }

  const isMc = step.kind === 'mc-zh-sv' || step.kind === 'mc-sv-zh';
  const isPinyin = step.kind === 'type-pinyin';
  const prompt = step.kind === 'mc-zh-sv'
    ? html`Vad betyder <strong>${item.hanzi}</strong>?`
    : step.kind === 'mc-sv-zh'
      ? html`Vilket betyder <strong>${item.sv}</strong>?`
      : isPinyin
        ? html`Skriv pinyin för <strong>${item.hanzi}</strong>.`
        : html`Skriv kinesiska tecken för <strong>${item.sv}</strong>.`;

  const mode = isMc ? 'multiple-choice' : isPinyin ? 'type-pinyin' : 'type-hanzi';

  function submitText(event) {
    event.preventDefault();
    if (!input.trim()) return;
    finish(isPinyin ? isCorrectPinyin(input, item) : isCorrectHanzi(input, item), mode);
  }

  return html`
    <section class="exercise-card">
      <div class="eyebrow">${isMc ? 'Flerval' : isPinyin ? 'Pinyin' : 'Tecken'}</div>
      <h2>${prompt}</h2>

      ${isMc && !result ? html`
        <div class="choice-grid">
          ${pickChoices(item, step.kind === 'mc-zh-sv' ? 'sv' : 'hanzi').map((choice) => html`
            <button class="choice" key=${choice.id} onClick=${() => finish(choice.id === item.id, mode, choice.label)}>
              ${choice.label}
            </button>
          `)}
        </div>
      ` : null}

      ${!isMc && !result ? html`
        <form onSubmit=${submitText} class="answer-form">
          <input
            value=${input}
            onInput=${(event) => setInput(event.currentTarget.value)}
            placeholder=${isPinyin ? 't.ex. fuxi eller fùxí' : 't.ex. 复习'}
            autocomplete="off"
            autocapitalize="none"
          />
          <${Button} progress=${progress} labelKey="term.answer" type="submit" disabled=${!input.trim()} />
        </form>
        <button class="link-button" onClick=${() => finish(false, mode, '')}>
          Visa svar / jag vet inte
        </button>
      ` : null}

      ${result ? html`
        <div class=${`result ${result.correct ? 'correct' : 'wrong'}`}>
          <strong>${result.correct ? 'Rätt!' : 'Inte riktigt.'}</strong>
          ${!result.correct ? html`
            <div>Rätt svar: <span class="hanzi">${item.hanzi}</span> · ${item.pinyin} · ${item.sv}</div>
          ` : null}
        </div>
        <${Button} progress=${progress} labelKey="action.next" onClick=${next} />
      ` : null}
    </section>
  `;
}
