import { html } from '../html.js';
import { uiHint, uiLabel } from '../uiText.js';

export function UiText({ progress, id, values = {}, className = '' }) {
  const hint = uiHint(progress, id, values);
  return html`
    <span class=${`ui-text ${className}`} title=${hint}>
      ${uiLabel(progress, id, values)}
    </span>
  `;
}
