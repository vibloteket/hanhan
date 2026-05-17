import { html } from '../html.js';
import { useEffect, useMemo, useState } from 'preact/hooks';
import { getLesson, lessonKey } from '../content/packs.js';
import { lessonSteps } from '../exercises.js';
import { ensureCards } from '../srs.js';
import { Button } from '../components/Button.js';
import { ExerciseCard } from '../components/ExerciseCard.js';

function matchingSession(progress, route) {
  const session = progress.activeSession;
  return session?.type === 'lesson' && session.packId === route.packId && session.lessonId === route.lessonId
    ? session
    : null;
}

export function LessonScreen({ progress, setProgress, route, go }) {
  const lesson = getLesson(route.packId, route.lessonId);
  const savedSession = matchingSession(progress, route);
  const [index, setIndex] = useState(() => savedSession?.index || 0);
  const [answers, setAnswers] = useState(() => savedSession?.answers || []);
  const steps = useMemo(() => lesson ? lessonSteps(lesson) : [], [lesson]);

  useEffect(() => {
    if (!lesson) return;
    setProgress((currentProgress) => {
      const currentSession = matchingSession(currentProgress, route);
      if (currentSession) return currentProgress;
      return {
        ...currentProgress,
        activeSession: {
          type: 'lesson',
          packId: route.packId,
          lessonId: route.lessonId,
          index: 0,
          answers: [],
          updatedAt: new Date().toISOString(),
        },
      };
    });
  }, [lesson, route.packId, route.lessonId, setProgress]);

  if (!lesson) return html`<section class="screen"><p>Lektionen hittades inte.</p></section>`;

  const current = steps[index];
  const finished = index >= steps.length;

  function saveSession(nextIndex, nextAnswers) {
    setProgress((currentProgress) => ({
      ...currentProgress,
      activeSession: {
        type: 'lesson',
        packId: route.packId,
        lessonId: route.lessonId,
        index: nextIndex,
        answers: nextAnswers,
        updatedAt: new Date().toISOString(),
      },
    }));
  }

  function advance(result = null) {
    const nextIndex = index + 1;
    const nextAnswers = result ? [...answers, result] : answers;
    setAnswers(nextAnswers);
    setIndex(nextIndex);
    saveSession(nextIndex, nextAnswers);
  }

  function completeLesson() {
    setProgress((currentProgress) => {
      const key = lessonKey(route.packId, route.lessonId);
      const withCards = ensureCards(currentProgress, lesson.items);
      return {
        ...withCards,
        activeSession: null,
        completedLessons: withCards.completedLessons.includes(key)
          ? withCards.completedLessons
          : [...withCards.completedLessons, key],
        unlockedUiKeys: Array.from(new Set([...withCards.unlockedUiKeys, ...(lesson.unlocksUiKeys || [])])),
        unlockedExerciseTypes: Array.from(new Set([...(withCards.unlockedExerciseTypes || []), ...(lesson.unlocksExerciseTypes || [])])),
        stats: {
          ...withCards.stats,
          lessonCompletions: (withCards.stats.lessonCompletions || 0) + 1,
          correctAnswers: (withCards.stats.correctAnswers || 0) + answers.filter((answer) => answer.correct).length,
        },
      };
    });
    go('home');
  }

  const correctCount = answers.filter((answer) => answer.correct).length;

  return html`
    <section class="screen lesson-screen">
      <div class="focus-top-row">
        <button class="brand-mark mini" onClick=${() => go('home')} aria-label="Hem"><img src="./assets/icons/icon.svg" alt="" /></button>
        <${Button} progress=${progress} labelKey="action.back" kind="ghost" onClick=${() => go('pack', { packId: route.packId })} />
        <span class="focus-spacer"></span>
        <span class="pill">${Math.min(index + 1, steps.length)}/${steps.length}</span>
      </div>
      <h1>${lesson.titleSv}</h1>
      <div class="progress-bar"><span style=${`width: ${Math.min(100, (index / Math.max(1, steps.length)) * 100)}%`}></span></div>

      ${finished ? html`
        <section class="exercise-card complete-card">
          <h2>Lektion klar</h2>
          <p>${correctCount}/${answers.length} övningar rätt. Orden läggs nu in i repetition, där skrivfrågor kommer gradvis senare.</p>
          ${lesson.unlocksUiKeys?.length ? html`<p>Du låste upp ${lesson.unlocksUiKeys.length} UI-termer.</p>` : null}
          <${Button} progress=${progress} labelKey="lesson.complete" onClick=${completeLesson} />
        </section>
      ` : html`
        <${ExerciseCard}
          progress=${progress}
          step=${current}
          onIntroDone=${() => advance()}
          onAnswer=${(result) => advance(result)}
        />
      `}
    </section>
  `;
}
