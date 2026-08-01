import { html } from '../html.js';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { Button } from './Button.js';
import { UiText } from './UiText.js';
import { pickChoices } from '../exercises.js';
import { isCorrectHanzi, isCorrectPinyin } from '../textUtils.js';

function isTypingTarget(target) {
  return target instanceof HTMLElement && (
    target.matches('input, textarea, select') || target.isContentEditable
  );
}

export function ExerciseCard({ progress, step, onAnswer, onIntroDone }) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const inputRef = useRef(null);
  const nextButtonRef = useRef(null);
  const item = step.item;
  const hanziLength = Array.from(item.hanzi || '').length;
  const hanziSizeClass = hanziLength >= 4 ? 'phrase' : hanziLength >= 3 ? 'long' : '';
  const isMc = step.kind === 'mc-zh-sv' || step.kind === 'mc-sv-zh';
  const isPinyin = step.kind === 'type-pinyin';
  const choices = useMemo(
    () => isMc ? pickChoices(item, step.kind === 'mc-zh-sv' ? 'sv' : 'hanzi', 4, progress) : [],
    [item.id, step.kind, progress.completedLessons, progress.cards]
  );

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

  useEffect(() => {
    if (step.kind === 'intro' || result) nextButtonRef.current?.focus();
    else if (!isMc) inputRef.current?.focus();
  }, [item.id, step.kind, result]);

  useEffect(() => {
    if (!isMc || result) return undefined;
    function handleChoiceKey(event) {
      if (isTypingTarget(event.target) || event.altKey || event.ctrlKey || event.metaKey) return;
      const index = Number(event.key) - 1;
      const choice = choices[index];
      if (!choice || index < 0 || index > 3) return;
      event.preventDefault();
      finish(choice.id === item.id, 'multiple-choice', choice.label);
    }
    addEventListener('keydown', handleChoiceKey);
    return () => removeEventListener('keydown', handleChoiceKey);
  }, [isMc, result, choices, item.id]);

  if (step.kind === 'intro') {
    return html`
      <section class="exercise-card intro-card">
        <div class="eyebrow"><${UiText} progress=${progress} id="term.word" /></div>
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
        <${Button} buttonRef=${nextButtonRef} progress=${progress} labelKey="action.next" onClick=${next} />
      </section>
    `;
  }

  const prompt = step.kind === 'mc-zh-sv'
    ? html`<${UiText} progress=${progress} id="prompt.whatMeans" values=${{ term: item.hanzi }} />`
    : step.kind === 'mc-sv-zh'
      ? html`<${UiText} progress=${progress} id="prompt.whichMeans" values=${{ term: item.sv }} />`
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
      <div class="eyebrow">${isMc
        ? html`<${UiText} progress=${progress} id="exercise.multipleChoice" />`
        : isPinyin
          ? html`<${UiText} progress=${progress} id="term.pinyin" />`
          : html`<${UiText} progress=${progress} id="term.hanzi" />`
      }</div>
      <h2>${prompt}</h2>

      ${isMc && !result ? html`
        <div class="choice-grid">
          ${choices.map((choice, index) => html`
            <button class="choice" key=${choice.id} onClick=${() => finish(choice.id === item.id, mode, choice.label)}>
              <span class="choice-key" aria-hidden="true">${index + 1}</span>
              <span>${choice.label}</span>
            </button>
          `)}
        </div>
      ` : null}

      ${!isMc && !result ? html`
        <form onSubmit=${submitText} class="answer-form">
          <input
            ref=${inputRef}
            value=${input}
            onInput=${(event) => setInput(event.currentTarget.value)}
            placeholder=${isPinyin ? 't.ex. fuxi eller fùxí' : 't.ex. 复习'}
            autocomplete="off"
            autocapitalize="none"
          />
          <${Button} progress=${progress} labelKey="term.answer" type="submit" disabled=${!input.trim()} />
        </form>
        <button class="link-button" onClick=${() => finish(false, mode, '')}>
          <${UiText} progress=${progress} id="action.showAnswer" /> / jag vet inte
        </button>
      ` : null}

      ${result ? html`
        <div class=${`result ${result.correct ? 'correct' : 'wrong'}`}>
          <strong><${UiText} progress=${progress} id=${result.correct ? 'feedback.correct' : 'feedback.wrong'} />${result.correct ? '!' : ''}</strong>
          <div class="answer-summary">
            ${!result.correct ? html`<span class="answer-prefix"><${UiText} progress=${progress} id="term.answer" />:</span>` : null}
            <span class="hanzi answer-hanzi">${item.hanzi}</span>
            <span class="answer-pinyin">${item.pinyin}</span>
            <span>${item.sv}</span>
          </div>
        </div>
        <${Button} buttonRef=${nextButtonRef} progress=${progress} labelKey="action.next" onClick=${next} />
      ` : null}
    </section>
  `;
}
