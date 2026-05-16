import { html } from '../html.js';
import { uiHint, uiLabel } from '../uiText.js';

export function UiText({ progress, id, className = '' }) {
  const hint = uiHint(progress, id);
  return html`
    <span class=${`ui-text ${className}`} title=${hint}>
      ${uiLabel(progress, id)}
    </span>
  `;
}
