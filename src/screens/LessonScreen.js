import { html } from '../html.js';
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { completedLessonRevision, getLesson, lessonItemsForRevision, lessonKey, lessonRevision, lessonUiKeysForRevision } from '../content/packs.js';
import { lessonSteps } from '../exercises.js';
import { ensureCards } from '../srs.js';
import { Button } from '../components/Button.js';
import { UiText } from '../components/UiText.js';
import { ExerciseCard } from '../components/ExerciseCard.js';

function matchingSession(progress, route, lesson = null) {
  const session = progress.activeSession;
  const matches = session?.type === 'lesson' && session.packId === route.packId && session.lessonId === route.lessonId;
  if (!matches) return null;
  if (lesson && session.revision !== lessonRevision(lesson)) return null;
  return session;
}

export function LessonScreen({ progress, setProgress, route, go }) {
  const lesson = getLesson(route.packId, route.lessonId);
  const completedRevision = lesson ? completedLessonRevision(progress, route.packId, route.lessonId) : 0;
  const isUpdate = Boolean(lesson && completedRevision > 0 && completedRevision < lessonRevision(lesson));
  const lessonItems = lesson ? lessonItemsForRevision(lesson, isUpdate ? completedRevision : 0) : [];
  const activeLesson = lesson ? { ...lesson, items: lessonItems } : null;
  const savedSession = matchingSession(progress, route, lesson);
  const [index, setIndex] = useState(() => savedSession?.index || 0);
  const [answers, setAnswers] = useState(() => savedSession?.answers || []);
  const completeButtonRef = useRef(null);
  const steps = useMemo(() => activeLesson ? lessonSteps(activeLesson, progress) : [], [lesson?.id, completedRevision, progress.unlockedExerciseTypes]);

  useEffect(() => {
    if (!lesson) return;
    setProgress((currentProgress) => {
      const currentSession = matchingSession(currentProgress, route, lesson);
      if (currentSession) return currentProgress;
      const now = new Date().toISOString();
      return {
        ...currentProgress,
        activeSession: {
          type: 'lesson',
          packId: route.packId,
          lessonId: route.lessonId,
          revision: lessonRevision(lesson),
          fromRevision: completedRevision,
          index: 0,
          answers: [],
          startedAt: now,
          updatedAt: now,
        },
      };
    });
  }, [lesson, route.packId, route.lessonId, setProgress]);

  useEffect(() => {
    if (lesson && index >= steps.length) completeButtonRef.current?.focus();
  }, [lesson, index, steps.length]);

  if (!lesson) return html`<section class="screen"><p>Lektionen hittades inte.</p></section>`;

  const current = steps[index];
  const finished = index >= steps.length;

  function saveSession(nextIndex, nextAnswers) {
    setProgress((currentProgress) => {
      const now = new Date().toISOString();
      return {
        ...currentProgress,
        activeSession: {
          type: 'lesson',
          packId: route.packId,
          lessonId: route.lessonId,
          revision: lessonRevision(lesson),
          fromRevision: completedRevision,
          index: nextIndex,
          answers: nextAnswers,
          startedAt: matchingSession(currentProgress, route, lesson)?.startedAt || now,
          updatedAt: now,
        },
      };
    });
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
      const now = new Date().toISOString();
      const session = matchingSession(currentProgress, route, lesson);
      const withCards = ensureCards(currentProgress, lessonItems);
      return {
        ...withCards,
        activeSession: null,
        completedLessons: withCards.completedLessons.includes(key)
          ? withCards.completedLessons
          : [...withCards.completedLessons, key],
        lessonMeta: {
          ...(withCards.lessonMeta || {}),
          [key]: {
            ...(withCards.lessonMeta?.[key] || {}),
            startedAt: session?.startedAt || withCards.lessonMeta?.[key]?.startedAt || now,
            completedAt: now,
            revision: lessonRevision(lesson),
          },
        },
        unlockedUiKeys: Array.from(new Set([...withCards.unlockedUiKeys, ...lessonUiKeysForRevision(lesson)])),
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
        <button class="brand-mark mini" onClick=${() => go('home')} aria-label="Hem"><img src="./assets/icons/icon.svg?v=81" alt="" /></button>
        <${Button} progress=${progress} labelKey="action.back" kind="ghost" onClick=${() => go('pack', { packId: route.packId })} />
        <span class="focus-spacer"></span>
        <span class="pill">${Math.min(index + 1, steps.length)}/${steps.length}</span>
      </div>
      <h1>${isUpdate ? `Uppdatering: ${lesson.titleSv}` : lesson.titleSv}</h1>
      ${isUpdate ? html`<p class="muted">Lektionen har ${lessonItems.length} nya ord sedan du gjorde den senast.</p>` : null}
      <div class="progress-bar"><span style=${`width: ${Math.min(100, (index / Math.max(1, steps.length)) * 100)}%`}></span></div>

      ${finished ? html`
        <section class="exercise-card complete-card">
          <h2><${UiText} progress=${progress} id="lesson.complete" /></h2>
          <p>${correctCount}/${answers.length} övningar <${UiText} progress=${progress} id="feedback.correct" />. ${isUpdate ? 'De nya orden läggs nu in i repetition.' : 'Orden läggs nu in i repetition, där skrivfrågor kommer gradvis senare.'}</p>
          ${lesson.unlocksUiKeys?.length ? html`<p>Du låste upp ${lesson.unlocksUiKeys.length} UI-termer.</p>` : null}
          <${Button} buttonRef=${completeButtonRef} progress=${progress} labelKey="lesson.complete" onClick=${completeLesson} />
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
