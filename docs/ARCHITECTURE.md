# Architecture: the source tree

The file-by-file tree of Kumimoji's source, from [the README's Architecture section](../README.md#architecture). A test holds this tree to the files under `src/`, so it cannot fall behind the code.

The rules are plain functions over plain data with no DOM: a game is a value,
every move returns the next one, and the same seed deals the same bag in every
browser. Word lists are loaded only when a game opens, and the table is its own
entry (`/ui` for plain DOM, `/element` for a tag, `/react` for React), so a page that wants only the
rules carries none of it. A computer player is pure too, so its turn replays
exactly after a reload.

```text
src/
├── check.ts            whether a finished grid completes a game: the one check a server also runs
├── computer.types.ts   what a computer did in one step of its turn
├── computerPlay.ts     the word a computer player lays: from its own hand, with no randomness
├── computerTurn.ts     a computer's whole turn, planned as steps the page can show one at a time
├── daily.ts            one seed a day, the same for everybody
├── element-define.ts   the "/element/define" entry: defines <kumimoji-table> on the page by being imported
├── element.ts          the "/element" entry: the <kumimoji-table> element, a game alone in a tag
├── export.ts           a game written out as JSON or plain text, and read back
├── generate.ts         making a game from a seed: a crossword laid first, then its tiles become the bag
├── grid.ts             the grid of tiles on a table with no edges, and how it is written as a string
├── help.ts             arranging the hand into a word, for a player who asks for help
├── index.ts            the main entry: the rules, the generator, the computer player and the table's pure helpers
├── judge.ts            judging a grid against its language's word list, run by run
├── kana.ts             Japanese tiles: the 45 base kana, and how every other kana is played as one of them
├── kumimoji.types.ts   the game's types: how much of the set a bag holds, and the rest
├── party.ts            pass and play: two to eight people round one device, one bag, a hand and a table each
├── party.types.ts      what a pass-and-play game was set up as
├── partyKept.ts        a pass-and-play game kept in the browser as one string of JSON
├── partySeats.ts       people and computers joining and leaving a pass-and-play game between turns
├── partyTurns.ts       how a pass-and-play turn ends, and how the game does, and who won
├── placement.ts        where a word can cross a crossword without spoiling it
├── play.ts             a game being played: the bag, the hand and the table, and every move on them
├── random.ts           a seeded random, so one seed deals one game in every browser
├── react.tsx           the "/react" entry: a grid to draw in React
├── showcase.ts         what the rules page shows of the game, worked out from the game's own tables
├── strings.ts          every word Kumimoji shows a person, in English and Japanese
├── tableView.ts        how the table is looked at: which squares are shown, and how big a tile is drawn
├── tileFace.ts         what a tile code shows, without loading a word list
├── tileFamily.ts       which tile of the set a tile is, without loading a word list
├── tileWords.ts        the word list, loaded once when a game opens
├── tileWordsModule.ts  the same lists where there is no browser, imported only by a server or a test
├── tiles.constants.ts  every number the game is played by: tile mixes, hand sizes, lengths of a game
├── turn.ts             turning the table while every tile stays upright
├── ui.ts               the "/ui" entry: Kumimoji played in the browser, in plain DOM
├── version.ts          the version of this package, as package.json has it
├── wilds.ts            a wild tile with no letter read as whatever makes the grid words
├── words.en.data.ts    the English word list
├── words.ja.data.ts    the Japanese word list and tile mix
├── words.ts            the "/words" entry: the word lists, for a place with no browser, such as a server or a test
└── ui/  the table that draws and plays a game
    ├── board.ts  how a tile on the table is drawn: sound, in a run that is not a word, or apart
    ├── mount.ts  the table itself: mounting it on a page, the options it takes, and playing it from a keyboard
    └── style.ts  the table's own styles, every colour and size a CSS variable so a page can restyle it
```

Tests sit beside the code they test (`*.test.ts`). `scripts/` builds the demo
and checks the package as npm packs it, `demo/` is the page published on
GitHub Pages, and `table/` taps it in real browsers.
