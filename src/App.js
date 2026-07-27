import { html } from './html.js';
import { useEffect, useState, useCallback } from 'preact/hooks';
import { loadProgress, saveProgress } from './storage.js';
import { HomeScreen } from './screens/HomeScreen.js';
import { PackScreen } from './screens/PackScreen.js';
import { LessonScreen } from './screens/LessonScreen.js';
import { ReviewScreen } from './screens/ReviewScreen.js';
import { SettingsScreen } from './screens/SettingsScreen.js';
import { ProgressScreen } from './screens/ProgressScreen.js';
import { LessonsScreen } from './screens/LessonsScreen.js';
import { WelcomeScreen } from './screens/WelcomeScreen.js';
import { UiText } from './components/UiText.js';
import { allItems, allLessons, completedLessonRevision, lessonItemsForRevision } from './content/packs.js';
import { ensureCards } from './srs.js';
import { setPwaSafeToUpdate } from './pwa.js';

function ensureCompletedLessonCards(progress) {
  const learnedIds = new Set(allLessons.flatMap((lesson) => {
    const revision = completedLessonRevision(progress, lesson.packId, lesson.id);
    return lessonItemsForRevision(lesson, 0)
      .filter((item) => (item.addedInRevision || 1) <= revision)
      .map((item) => item.id);
  }));
  const eligibleCards = Object.fromEntries(
    Object.entries(progress.cards || {}).filter(([, card]) => learnedIds.has(card.itemId))
  );
  return ensureCards({ ...progress, cards: eligibleCards }, allItems.filter((item) => learnedIds.has(item.id)));
}

function useDueRefresh(setProgress) {
  const handleVisibility = useCallback(() => {
    if (document.visibilityState === 'visible') {
      setProgress((prev) => ({ ...prev }));
    }
  }, [setProgress]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        setProgress((prev) => ({ ...prev }));
      }
    }, 30_000);

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleVisibility);
    };
  }, [handleVisibility]);
}

function routeFromHistory() {
  return history.state?.mandarinModeRoute || { screen: 'home' };
}

export function App() {
  const [progress, setProgress] = useState(() => ensureCompletedLessonCards(loadProgress()));
  const [route, setRoute] = useState(() => routeFromHistory());
  const [started, setStarted] = useState(false);

  useEffect(() => saveProgress(progress), [progress]);
  useEffect(() => setPwaSafeToUpdate(route.screen !== 'lesson' && route.screen !== 'review'), [route.screen]);
  useDueRefresh(setProgress);

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
    if (screen === 'home') setStarted(true);
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
  else if (route.screen === 'about') screen = html`<${WelcomeScreen} go=${go} showAppLink=${true} />`;
  else if (route.screen === 'home') {
    const isNewUser = !started && progress.completedLessons.length === 0 && !progress.activeSession;
    screen = isNewUser
      ? html`<${WelcomeScreen} go=${go} showAppLink=${false} />`
      : html`<${HomeScreen} progress=${progress} setProgress=${setProgress} go=${go} />`;
  } else {
    screen = html`<${HomeScreen} progress=${progress} setProgress=${setProgress} go=${go} />`;
  }

  const focusMode = route.screen === 'lesson' || route.screen === 'review';

  return html`
    <div class=${`app-shell ${focusMode ? 'focus-mode' : ''}`}>
      ${focusMode ? null : html`
        <header class="app-header">
          <button class="brand" onClick=${() => go('home')}>
            <span class="brand-mark"><img src="./assets/icons/icon.svg?v=81" alt="" /></span>
            <span><${UiText} progress=${progress} id="app.title" /></span>
          </button>
        </header>
      `}
      <main>${screen}</main>
    </div>
  `;
}
