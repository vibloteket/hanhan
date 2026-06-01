import { html } from './html.js';
import { useEffect, useState } from 'preact/hooks';
import { loadProgress, saveProgress } from './storage.js';
import { HomeScreen } from './screens/HomeScreen.js';
import { PackScreen } from './screens/PackScreen.js';
import { LessonScreen } from './screens/LessonScreen.js';
import { ReviewScreen } from './screens/ReviewScreen.js';
import { SettingsScreen } from './screens/SettingsScreen.js';
import { ProgressScreen } from './screens/ProgressScreen.js';
import { LessonsScreen } from './screens/LessonsScreen.js';
import { UiText } from './components/UiText.js';

function routeFromHistory() {
  return history.state?.mandarinModeRoute || { screen: 'home' };
}

export function App() {
  const [progress, setProgress] = useState(() => loadProgress());
  const [route, setRoute] = useState(() => routeFromHistory());

  useEffect(() => saveProgress(progress), [progress]);

  useEffect(() => {
    if (!history.state?.mandarinModeRoute) {
      history.replaceState({ ...(history.state || {}), mandarinModeRoute: route }, '', location.href);
    }

    function handlePopState() {
      setRoute(routeFromHistory());
      window.scrollTo({ top: 0 });
    }

    addEventListener('popstate', handlePopState);
    return () => removeEventListener('popstate', handlePopState);
  }, []);

  function go(screen, params = {}, options = {}) {
    const nextRoute = { screen, ...params };
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setRoute(nextRoute);
    const nextState = { ...(history.state || {}), mandarinModeRoute: nextRoute };
    if (options.replace) history.replaceState(nextState, '', location.href);
    else history.pushState(nextState, '', location.href);
  }

  let screen;
  if (route.screen === 'pack') screen = html`<${PackScreen} progress=${progress} route=${route} go=${go} />`;
  else if (route.screen === 'lesson') screen = html`<${LessonScreen} progress=${progress} setProgress=${setProgress} route=${route} go=${go} />`;
  else if (route.screen === 'review') screen = html`<${ReviewScreen} progress=${progress} setProgress=${setProgress} go=${go} />`;
  else if (route.screen === 'progress') screen = html`<${ProgressScreen} progress=${progress} go=${go} />`;
  else if (route.screen === 'lessons') screen = html`<${LessonsScreen} progress=${progress} go=${go} />`;
  else if (route.screen === 'settings') screen = html`<${SettingsScreen} progress=${progress} setProgress=${setProgress} go=${go} />`;
  else screen = html`<${HomeScreen} progress=${progress} setProgress=${setProgress} go=${go} />`;

  const focusMode = route.screen === 'lesson' || route.screen === 'review';

  return html`
    <div class=${`app-shell ${focusMode ? 'focus-mode' : ''}`}>
      ${focusMode ? null : html`
        <header class="app-header">
          <button class="brand" onClick=${() => go('home')}>
            <span class="brand-mark"><img src="./assets/icons/icon.svg?v=42" alt="" /></span>
            <span><${UiText} progress=${progress} id="app.title" /></span>
          </button>
        </header>
      `}
      <main>${screen}</main>
    </div>
  `;
}
