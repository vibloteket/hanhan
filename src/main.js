import { render } from 'preact';
import { html } from './html.js';
import { App } from './App.js';

render(html`<${App} />`, document.getElementById('app'));
