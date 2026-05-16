import { html } from '../html.js';
import { useMemo, useState } from 'preact/hooks';
import { getLesson, lessonKey } from '../content/packs.js';
import { lessonSteps } from '../exercises.js';
import { ensureCards } from '../srs.js';
import { Button } from '../components/Button.js';
import { ExerciseCard } from '../components/ExerciseCard.js';

export function LessonScreen({ progress, setProgress, route, go }) {
  const lesson = getLesson(route.packId, route.lessonId);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const steps = useMemo(() => lesson ? lessonSteps(lesson) : [], [lesson]);

  if (!lesson) return html`<section class="screen"><p>Lektionen hittades inte.</p></section>`;

  const current = steps[index];
  const finished = index >= steps.length;

  function advance(result = null) {
    if (result) setAnswers((previous) => [...previous, result]);
    setIndex((value) => value + 1);
  }

  function completeLesson() {
    setProgress((currentProgress) => {
      const key = lessonKey(route.packId, route.lessonId);
      const withCards = ensureCards(currentProgress, lesson.items);
      return {
        ...withCards,
        completedLessons: withCards.completedLessons.includes(key)
          ? withCards.completedLessons
          : [...withCards.completedLessons, key],
        unlockedUiKeys: Array.from(new Set([...withCards.unlockedUiKeys, ...(lesson.unlocksUiKeys || [])])),
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
      <div class="top-row">
        <${Button} progress=${progress} labelKey="action.back" kind="ghost" onClick=${() => go('pack', { packId: route.packId })} />
        <span class="pill">${Math.min(index + 1, steps.length)}/${steps.length}</span>
      </div>
      <h1>${lesson.titleSv}</h1>
      <div class="progress-bar"><span style=${`width: ${Math.min(100, (index / Math.max(1, steps.length)) * 100)}%`}></span></div>

      ${finished ? html`
        <section class="exercise-card complete-card">
          <h2>Lektion klar</h2>
          <p>${correctCount}/${answers.length} övningar rätt. Orden läggs nu in i repetition.</p>
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
