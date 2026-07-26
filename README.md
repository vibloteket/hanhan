<p align="center">
  <a href="https://hanhan.viblo.se/">
    <img src="assets/icons/icon.svg" alt="HanHan" width="180">
  </a>
</p>

# HànHàn (汉汉)

HànHàn is a small, static web app for Swedish speakers learning beginner Mandarin. It teaches simplified Chinese characters, pinyin, common words, and app UI terms through short lessons, local progress tracking, and simple spaced repetition. The app is buildless, backend-free, and stores progress locally in the browser.

HànHàn är en liten, statisk webbapp för att lära sig grundläggande mandarin från svenska.

Appen är byggd för nybörjare och använder gradvis kinesisk UI-immersion: först visas svenska, sedan kinesiska + svenska, och till slut bara kinesiska när orden sitter.

## Live

- Live App: <https://hanhan.viblo.se/>

## Funktioner

- Svenska → förenklad kinesiska med pinyin
- Korta lektioner med tecken, ord och UI-termer
- Repetition med enkel SRS-logik
- Lokal progress i webbläsaren via `localStorage`
- Export/import av backup som JSON
- Mobilvänlig, statisk och utan backend

## Kör lokalt

Ingen build behövs. Servera bara katalogen statiskt, till exempel:

```bash
python3 -m http.server 8000
```

Öppna sedan:

```txt
http://localhost:8000/
```

## Tester

```bash
npm test
```

Syntaxkoll:

```bash
npm run check
```

## Källkod och licens

HànHàn är fri programvara med öppen källkod. Koden finns på <https://github.com/vibloteket/hanhan> och licensieras under AGPL-3.0-or-later.

Kontakt: <vb@viblo.se>
