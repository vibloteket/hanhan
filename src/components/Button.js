import { html } from '../html.js';
import { UiText } from './UiText.js';

export function Button({ progress, labelKey, children, onClick, kind = 'primary', disabled = false, type = 'button', buttonRef = null }) {
  return html`
    <button ref=${buttonRef} class=${`button ${kind}`} onClick=${onClick} disabled=${disabled} type=${type}>
      ${labelKey ? html`<${UiText} progress=${progress} id=${labelKey} />` : children}
    </button>
  `;
}
