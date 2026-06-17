# HànHàn design principles

HànHàn is a small Swedish → Mandarin learning app where the interface itself becomes part of the study material.

The goal is not to translate the whole app into Chinese as quickly as possible. The goal is to make the UI become more Chinese only when the learner has actually learned the relevant words.

## Product idea

HànHàn teaches practical Mandarin from Swedish through:

- short lessons
- local progress
- spaced repetition / review
- app UI words as study material
- a UI that gradually becomes more Chinese

The app should feel beginner-friendly, mobile-first, and low-friction.

## Language and UI immersion

There are three levels of text in the app:

| Level | Examples | Dynamic Chinese? |
|---|---|---|
| UI labels | Starta, Repetera, Inställningar, Nästa, Visa svar | Yes |
| Microcopy | Språk, backup, import/export; Fokus, integritet, kontakt | Usually no |
| Explanatory text | Welcome text, lesson descriptions, settings explanations | No |

Dynamic Chinese is for recurring UI labels, not for every sentence in the app.

Keep explanatory Swedish text stable and understandable. Welcome/Om pages are for orientation, not tests.

## Dynamic UI labels

Default UI mode is **dynamic**.

A UI label should move through these stages:

| Status | Display |
|---|---|
| Not unlocked | Swedish |
| Unlocked but not mastered | Chinese + Swedish |
| Mastered | Chinese only |

Current mastery threshold:

```txt
correctStreak >= 4
```

If the learner answers incorrectly, the SRS card's streak drops/reset, so Swedish support automatically returns.

Even when a label is shown as Chinese-only, Swedish support should remain available as a hint/title where practical.

## UI modes

The app should keep UI modes simple:

1. **Dynamic** — default: Swedish → Chinese + Swedish → Chinese when mastered
2. **Swedish** — always Swedish where possible
3. **Chinese for unlocked words** — Chinese for unlocked UI labels

Avoid adding many overlapping modes unless there is a clear learner need.

## What should become dynamic

Good candidates:

- Starta / Fortsätt / Repetera
- Inställningar
- Ordlista
- Lektioner
- Nästa
- Visa svar
- Rätt / Fel
- Om HànHàn, if implemented as a UI term such as 关于汉汉

Usually keep Swedish:

- pack descriptions
- lesson descriptions
- WelcomeScreen body text
- settings help text
- data/privacy explanations
- feature-card descriptions

Example:

```txt
设置 · Inställningar
Språk, backup, import/export
```

When mastered:

```txt
设置
Språk, backup, import/export
```

## Lesson design

Lessons should build from parts to whole when that helps the learner.

Prefer:

```txt
下 → 一 → 个 → 下一个
显 → 示 → 显示 → 显示答案
```

Avoid showing a longer UI phrase before the learner has seen its important parts, unless the parts are too obscure or not useful on their own.

When deciding whether to teach components separately:

- teach common or reusable components separately
- teach the whole word in the same lesson when possible, so the learner sees why the parts matter
- avoid turning every word into a character etymology lesson
- keep lessons coherent even if that makes some lessons slightly longer

## Progress and mastery

Mastery should be based on recent correct performance, not just lesson completion.

Current rule:

```txt
4 correct answers in a row = Sitter / mastered
```

A mastered card can lose mastered status if the learner answers wrong later. This is intentional: the UI should adapt to current memory, not treat mastery as permanent.

Use the Swedish label **Sitter** for mastered cards in learner-facing UI.

## Welcome / About / Settings

Root `/` is the app.

New visitors see a WelcomeScreen. Returning users go directly to HomeScreen.

The Welcome/Om content should be available from HomeScreen, but should not interrupt daily use.

Settings is for:

- language mode
- backup/import/export/reset
- version/build/date/asset info
- license and contact

Avoid duplicating the full Welcome/Om content inside Settings.

## Technical constraints

HànHàn is intentionally simple:

- static/buildless SPA
- Preact + htm
- vendored browser dependencies
- no backend
- no account system
- progress in `localStorage`
- JSON export/import for backup

Do not introduce build tooling, TypeScript, backend services, or runtime dependencies without a strong reason.

## Deployment and cache discipline

Run tests before declaring changes done:

```sh
npm test
```

Deploy with:

```sh
./scripts/deploy-var-www.sh hanhan
```

When changing JS, CSS, HTML, or SVG assets, bump the cache version references in HTML/source files before deploy.

The deployed JS module graph is versioned so browsers fetch fresh modules after each deploy.

## Change checklist

Before changing UI/content, ask:

- Is this a recurring UI label or explanatory Swedish text?
- Should it be a `uiKey` and taught in a lesson?
- Does the lesson teach useful parts before the whole word?
- Does the change preserve beginner-friendliness?
- Does it work on mobile?
- Did tests pass?
- Was the cache version bumped before deploy?
