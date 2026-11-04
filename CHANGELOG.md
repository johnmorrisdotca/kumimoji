# Changelog

All notable changes to this project are written down here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.6.0] - 2026-11-04

A minor version: nothing that 1.5.0 gave is taken away except five lines that are obscene in themselves. The English list, the rules and the saved-game format are unchanged.

### Changed

- **The Japanese word list no longer leaves out ordinary words** (MODULES-392; John, 2026-11-04: "we can't filter out regular good words"). Kotoba's children bar, which writes the list, is narrowed: a line is out only when every entry that spells it is marked vulgar, X-rated, sensitive or derogatory by JMdict, or has a first sense that names a sex act, a sex organ or the sex trade, or it is a reading on Kotoba's short list of obscene ones. A sense that only mentions sex is no longer enough. 86 lines are back, among them せいべつ (性別), いせい (異性), どうせい (同性), きょうがく (共学), こんりゅう (建立), まぜもの (混ぜ物), そうにゅう (挿入), ふじゅん (不純), なのはな (菜の花), あいじん (愛人).
- **Five lines are held out by name**: まんこ and うんこ and おっぱい and ちんこ, which JMdict marks nothing or shares with an ordinary word (万古 is also まんこ), and れいふ, the line that れいぷ plays on the tiles (it is also 霊符, a charm, which goes out with it). The list is 162,243 readings, 86 more and 5 fewer: 162,324.
- **A seeded Japanese game is dealt differently**, as the list has other words to choose among; English games and the saved-game format are unchanged.

## [1.5.0] - 2026-11-04

A minor version: nothing that 1.4.0 gave is taken away except what children should not have been handed. The English list, the rules and the saved-game format are unchanged.

### Changed

- **The Japanese word list leaves out what is not for children** (MODULES-390). Children play this game, and the list was every kana reading of every JMdict entry. It now has the bar of Kotoba's kana lists (`scripts/children-bar.mjs` in Kotoba, which writes the list with `scripts/word-lists-ja.mjs`): a reading is out when every JMdict entry that spells it has a vulgar, X-rated, sensitive or derogatory mark on its first sense, or a first sense whose gloss names sex or the sex trade. A reading that an ordinary entry is also spelt like stays, and so does a line that another word plays: the tiles play ば and ぱ as は, so れいぷ is the line れいふ, which is also 霊符 (a charm). Of the 163,585 lines JMdict's release of 2026-11-04 gives, 1,347 are barred (110 of 3 kana, 347 of 4, 264 of 5, 626 longer), among them せっくす, ばいしゅん, ぽるの, えろい, おなに, ちくび, ふぇらちお, せいどれい, いんらん, ちんぽ and らぶほてる; the 5 words earlier lists held that JMdict no longer lists are kept, so a game kept half way still checks. The list holds **162,243** readings (163,461 in 1.4.0). A test (`src/childrenBar.test.ts`) holds the known bad readings out. The guide "Load and judge with word lists" says what is left out, in English and in Japanese.
- **A seeded Japanese game is dealt differently**, as the list has fewer words to choose among: the same seed gives another bag. English games are unchanged, and so is the saved-game format; a kept Japanese game checks as before unless it spells one of the barred lines.
- The Japanese list is made again from JMdict's release of 2026-11-04 (it was 2026-09-28): 129 readings join, 5 are kept that JMdict dropped.
- The package is a little smaller: the Japanese list is 715 kB (394 kB gzipped), and the sizes in `docs/bundle-size.json` are measured again.

### Added

- The README opens with the package's thumbnail, and the demo carries it as its link preview (og:image) and publishes the card, a dark card and an icon on Pages at `thumbnail.png`, `thumbnail-dark.png` and `icon.png`.

## [1.4.0] - 2026-11-02

### Added

- A table can be laid in the family's five cloths: `<kumimoji-table cloth="blue">`, `mountKumimoji(el, { cloth })` and `set({ cloth })`, the `cloth` embed parameter and Builder option, and `KUMIMOJI_CLOTHS`, `isCloth` and `clothVars` from `/ui`. The demo's header patches lay it through the page's theme.

- **`checkKumimoji` gives its reason as a code and values as well as in English.** A refusal is now `{ ok: false, reason, code, values }`: `reason` is the sentence it has always been, word for word, and `code` (`"no-hand"`, `"givens-not-bag"`, `"wild-count-wrong"`, `"bag-exceeds-set"`, `"answer-not-grid"`, `"grid-not-the-bag"`, `"tiles-apart"`, `"not-a-word"` and `"grid-not-finished"`) and `values` (`{ size }` for `no-hand`, `{ word }` for `not-a-word`) let a site say it in its own language. `KUMIMOJI_CHECK_REASONS` lists every code with its English clause, `kumimojiRefusal(code, values)` makes a refusal, and the types are `KumimojiCheckCode` and `KumimojiCheckValues`. A test holds every refusal's `reason` to its code's clause filled with its values.

## [1.3.1] - 2026-10-31

### Changed

- Biome replaces ESLint as the formatter and linter, with the family's shared settings in `scripts/biome-family.json`; `pnpm lint` checks formatting too, and `pnpm format` applies it. The code is formatted once to 120 columns. Nothing a user of the package sees has changed.
- TypeScript targets ES2022, treats an indexed read as possibly missing, and refuses switch fallthrough and unmarked overrides.
- `pnpm check` also holds every source file to at most 500 lines of code (`scripts/check-size.mjs`; blank lines, comments, tests and data files are not counted).

### Fixed

- The issue chooser's security link shows again: an unquoted colon had made `.github/ISSUE_TEMPLATE/config.yml` invalid YAML.

## [1.3.0] - 2026-10-14

The table is a custom element with the family's standard embed attributes and a shared builder, and the package has an English and Japanese documentation site with a checked example for every export. The rules, generation, seeds and saved games are unchanged.

### Added

- Add the bilingual documentation site, checked public examples, paired guides, local search and machine-readable pages.
- Add the shared crossword-table builder and validated iframe route with reflected settings and display options. Preserve native saved/table access and gameplay methods; presentation updates now retain play.
- Add native ready/set, optional initial saved state, control visibility and localized load failures, forwarded by the React wrapper. Preserve event shapes with composed JSON-safe snapshots and add load/error events.
- Share a package-independent embed builder for option controls, preview adapters, code tabs and shareable links.

### Changed

- Synchronize documentation tooling for repository layouts, generated type references, Node entry points and repository-specific README links.
- Keep large documentation resource catalogues on the entry index and the active resource beside core navigation, preserving every reference page; render valid default imports in HTML and Markdown.
- The props table of `KumimojiBoard` moved from the README to `docs/react.md`, so that the README, which now lists the sports packages too, stays under npm's 65,536 characters; the README keeps a summary and a link.
- Group the package family by kind, alphabetize each group, and include the geography packages and REST in Pieces in the shared footer and README.
- Update the shared family description for addresses in all seven supported countries, including France and Germany.

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

[Unreleased]: https://github.com/johnmorrisdotca/kumimoji/compare/v1.5.0...HEAD
[1.5.0]: https://github.com/johnmorrisdotca/kumimoji/compare/v1.4.0...v1.5.0
[1.4.0]: https://github.com/johnmorrisdotca/kumimoji/compare/v1.3.1...v1.4.0
[1.3.0]: https://github.com/johnmorrisdotca/kumimoji/compare/v1.2.2...v1.3.0
[1.2.1]: https://github.com/johnmorrisdotca/kumimoji/compare/v1.2.0...v1.2.1
[1.1.1]: https://github.com/johnmorrisdotca/kumimoji/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/johnmorrisdotca/kumimoji/releases/tag/v1.1.0
[1.0.1]: https://github.com/johnmorrisdotca/kumimoji/releases/tag/v1.0.1
[1.0.0]: https://github.com/johnmorrisdotca/kumimoji/releases/tag/v1.0.0
[0.1.0]: https://github.com/johnmorrisdotca/kumimoji/commits/v1.0.0
