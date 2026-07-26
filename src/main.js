import { render } from 'preact';
import { html } from './html.js';
import { App } from './App.js';
import { registerPwa } from './pwa.js';

registerPwa();
render(html`<${App} />`, document.getElementById('app'));
