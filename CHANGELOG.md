# Changelog

All notable changes to this project are written down here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-09-30

Nothing that was exported has changed, a seed deals the bag it always dealt,
and the word lists and how they load are as they were.

### Added

- **Export and import.** `kumimojiToJSON` writes a game alone as versioned
  JSON (`"format": 1`): how it was set up, its seed and where the player has
  got to. `kumimojiFromJSON` reads it back by dealing the bag again from the
  seed and checking every tile held against it, so nothing in a file is
  trusted. `kumimojiToText` is a game as plain text and `gridToText` a
  crossword as it lies. `kumimojiExported`, `kumimojiClock`,
  `KUMIMOJI_EXPORT_FORMAT`, `KumimojiSaved` and `KumimojiExported` with them.
- **The table's words in English and Japanese**, in one table,
  `KUMIMOJI_STRINGS`, listed side by side in `docs/strings-ja.md`.
  `mountKumimoji` takes `locale` and `strings`, follows the page's `lang`, and
  its handle has `setLocale`. `kumimojiStrings`, `kumimojiSay`,
  `KumimojiStrings` and `KumimojiLocale`. The Japanese has not yet been
  reviewed by a native reader.
- **Saving and loading on the table**: save as JSON or as text, and load a
  saved game back with its clock going on. `keep: false` leaves it off; the
  handle has `saved` and `setGame`, and the table takes `onChange`.
- **Theming.** `--km-radius` and `--km-font` beside the colours, and
  `mountKumimoji` takes a `theme`.
- `KUMIMOJI_VERSION`.
- A doc comment on every export, held by a test.
- The README says near its top, and in a section of its own, what each word
  list is, where it came from and under what terms: SCOWL's permissive
  licence, and CC BY-SA 4.0, attribution and share-alike, for the list derived
  from JMdict.
- The demo in the family's look, in English and Japanese, a game kept on the
  device between visits.
- Checks: the package packed by npm, installed in an empty project, every
  entry imported and required, both lists read and their notices found in the
  tarball, on Linux, macOS and Windows; every example in the README run; the
  table tapped in Chromium and WebKit; and the table built and played in
  React, Vue, Svelte, Angular and a plain page.

### Changed

- A square and a tile on the table are 44px, from 36px, and every button is
  at least 44px: a fingertip. `--km-square` sets another size.
- `package.json` has `main`, `module` and `types` beside `exports`, for tools
  that read those.
- `--km-apart`, which nothing used, is no longer defined.

## [1.0.1] - 2026-09-30

### Fixed

- The package loads through `require()` as well as `import` (Node 22 and
  later, and test runners that compile to CommonJS): each export's condition is
  `default` rather than `import`.

## [1.0.0] - 2026-09-30

The first stable release: the API as documented in the README is now kept stable
until a 2.0.0.

## [0.1.0] - 2026-09-30

The first release.

### Added

- Games dealt from a seed by laying a crossword first, so every bag can be
  finished: hands of 3, 7 or 11, three levels of wild tiles, short, medium and
  full games, and two English sets at once.
- English and Japanese: 144 tiles in each, 110,316 English words from SCOWL and
  163,461 Japanese readings from JMdict, loaded when first needed.
- Playing a game as plain values: lay, move, swap, lift, sort, draw and trade
  one tile for three; wild tiles given any letter or kana.
- Every run across and down judged against the list, with Diagonals as a
  choice; a finished grid checked against its bag in time proportional to its
  size; points for a finish, ten a tile and more for speed.
- Help: the words the hand's own tiles spell, longest first.
- A table of two to eight sharing one bag: turns, drawing together, the last
  round, going out, resigning, joining and leaving, kept as text; and a
  computer player that can take a seat.
- Turning the table a quarter at a time with every tile kept upright, and the
  sums for fitting, zooming and panning a view of it.
- A whole game alone in plain DOM (`@johnmorrisdotca/kumimoji/ui`), light and
  dark, themeable through CSS variables.
- `KumimojiBoard` and `KumimojiTable`, React components, from
  `@johnmorrisdotca/kumimoji/react`.
- A static demo for GitHub Pages.

[Unreleased]: https://github.com/johnmorrisdotca/kumimoji/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/johnmorrisdotca/kumimoji/releases/tag/v1.1.0
[1.0.1]: https://github.com/johnmorrisdotca/kumimoji/releases/tag/v1.0.1
[1.0.0]: https://github.com/johnmorrisdotca/kumimoji/releases/tag/v1.0.0
[0.1.0]: https://github.com/johnmorrisdotca/kumimoji/commits/v1.0.0
