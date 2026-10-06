# Changelog

All notable changes to this project are written down here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.2] - 2026-10-06

Nothing that was exported has changed.

### Changed

- The README takes the family's one layout, fully: a hero picture of the demo on a desk and on a phone in light and dark, a picture of each kind of table (English, kana, a run that is not a word, a hand of eleven, a wild tile), an Examples section of ten examples whose output is what they print, an Install section, and a short list of the calls to learn first. Its pictures are in `docs/images` (WebP, light and dark) and are retaken with `pnpm screenshots:readme` (it replaces `pnpm pictures` and the two JPEGs `docs/desktop.jpg` and `docs/phone.jpg`); they are not in the tarball, and `pnpm test:package` fails if one is.
- To keep the README under the 64,000 characters npm can show, the long tables of exports (dealing and judging, tiles and grids, playing, the table of players, looking at the table) and the table's, the element's and the React components' options moved to `docs/API.md`, and the source tree moved to `docs/ARCHITECTURE.md`, each with a summary and a link left in the README. Nothing was removed, and the tests that hold these tables to the code read the README and `docs/API.md` together.
- `pnpm test:readme` type-checks and runs every TypeScript and JavaScript example in the README against the built package, as a CI job of its own, and `pnpm check` holds the README to the family's lint.
- "The command line" says there is none, and now sits after the languages, where the other sections of the standard's order leave room for it.
- Repository only: the package and everything it exports are unchanged. `CONTRIBUTING.md` is the family's one text with a section of its own for Kumimoji, held to the master in johnmorrisdotca/.github by `src/family.test.js`; `ci.yml` and `pages.yml` are the family's one text (`pnpm check`, the demo, and the package on Linux, macOS and Windows), and any jobs of the package's own after them.

### Fixed

- The API reference page wraps a long entry path instead of running about 2 px wider than a 360 px screen. Nothing the package exports has changed.

## [1.2.1] - 2026-10-05

Nothing that was exported has changed.

### Added

- A test holds every `@johnmorrisdotca/kumimoji@N` version pin in the README to this package's major version.

### Changed

- The family's list, in the README and in the demo's footer, names all twenty-four packages, Karakuri and Houseki included.
- The npm description is one sentence of 250 characters or fewer, so npm and its search show it whole; it is also the repository's About text. `homepage` is the demo site and `author` is `"John Morris"`, the same in every package.
- The GitHub Actions workflows use the current versions of the actions (checkout 7, setup-node 7, pnpm/action-setup 6; configure-pages 6, upload-pages-artifact 5 and deploy-pages 5 for Pages), which clears GitHub's Node 20 deprecation warning.
- Every entry has an `import` condition beside `default`.

## [1.2.0] - 2026-10-01

Nothing that was exported has changed; the rules, the word lists, every deal and every saved game are exactly as they were.

### Added

- **`<kumimoji-table>`**, a game alone as a tag, with no framework: `@johnmorrisdotca/kumimoji/element/define` defines it (or `…/element` holds the class alone), and `language`, `hand`, `level`, `length`, `diagonals`, `seed`, `lang` and `keep` are attributes, read again when they change. It fires `kumimoji-change` after every change to the game and `kumimoji-finish` when it is won. A table the rules do not offer draws nothing.
- **A bag a day**: `kumimojiDailySeed(date)` is the UTC date as a number (2026-10-01 is `20261001`), the same seed for everybody and the same number as Tane's `dailySeed`; `kumimojiDay(date)` writes the day. The tag takes `seed="daily"`, and the demo has Today's game.
- **Played from a keyboard.** Tab lands on one square of the table and one tile of the hand; the arrow keys move between squares, and Left, Right, Home and End between the hand's tiles; Enter or Space picks up and lays; Escape lets go of a tile. The keyboard stays where it was after each move, on the squares, the hand and the buttons under the table. The table's notes are a polite live region. One new word in both languages (`tableKeys`) describes the table for a screen reader.
- **Demo:** a table in a tag, Today's game, and Copy link, which copies an address that deals the same game (its seed, tiles, hand, wilds, length and diagonals).
- **README:** an Accessibility section, "The element", "The day's seed", and the list of all sixteen packages of the family.
- A *word list* issue template, a pull request template, SECURITY.md and CODE_OF_CONDUCT.md as the family's shared text (held equal by a test), and the family's house rules in CONTRIBUTING.md.

### Changed

- **Node 22 or later** (`engines`), where it said 20, which is out of support and was never tested. The package's `sideEffects` also names the file that defines the tag.
- **A Help switch in the demo.** Beside the language chooser in the family header, shared by every demo. Off (the default) the page is as it was; on, each option row (the tiles, the hand, the wilds) says in one plain line what it does, in English or Japanese, and every button in it has the same words as its hover text. Kept on the device.
- The README's pictures are taken again, with the Help switch in the header.

## [1.1.1] - 2026-10-01

Nothing that was exported has changed.

### Added

- **An API reference page**, `api.html` on the demo site: every export of every entry point, with its signature and its doc comment, made from the source when the site is built so it cannot fall behind the code. The README and the demo's header link to it, and a test holds it to the source.
- **An Architecture section in the README**: how the source is split and what each file is for, held to the real files by a test.

### Changed

- The family's footer lists Jarajara.

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

[Unreleased]: https://github.com/johnmorrisdotca/kumimoji/compare/v1.2.1...HEAD
[1.2.1]: https://github.com/johnmorrisdotca/kumimoji/compare/v1.2.0...v1.2.1
[1.1.1]: https://github.com/johnmorrisdotca/kumimoji/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/johnmorrisdotca/kumimoji/releases/tag/v1.1.0
[1.0.1]: https://github.com/johnmorrisdotca/kumimoji/releases/tag/v1.0.1
[1.0.0]: https://github.com/johnmorrisdotca/kumimoji/releases/tag/v1.0.0
[0.1.0]: https://github.com/johnmorrisdotca/kumimoji/commits/v1.0.0
