import { html } from '../html.js';
import { uiHint, uiLabelParts } from '../uiText.js';

export function UiText({ progress, id, values = {}, className = '' }) {
  const hint = uiHint(progress, id, values);
  return html`
    <span class=${`ui-text ${className}`} title=${hint}>
      ${uiLabelParts(progress, id, values).map((part) =>
        typeof part === 'string' ? part : html`<strong class="prompt-term">${part.value}</strong>`
      )}
    </span>
  `;
}
