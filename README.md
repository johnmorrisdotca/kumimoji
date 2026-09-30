<h1 align="center">Kumimoji <sub>組み文字</sub></h1>

<p align="center"><strong>The crossword tile race: a word game where you build one crossword from a bag of letter tiles.</strong><br>
In English and in Japanese kana. The rules as pure, seeded TypeScript, two word lists, a computer player, and a table to play on in React, Vue, Svelte, Angular or plain HTML.</p>

<p align="center">
  <a href="https://github.com/johnmorrisdotca/kumimoji/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/johnmorrisdotca/kumimoji/actions/workflows/ci.yml/badge.svg"></a>
  <a href="https://www.npmjs.com/package/@johnmorrisdotca/kumimoji"><img alt="npm" src="https://img.shields.io/npm/v/@johnmorrisdotca/kumimoji?color=2f5d4a"></a>
  <a href="./LICENSE"><img alt="Code: MIT licence" src="https://img.shields.io/badge/code-MIT-2f5d4a"></a>
  <a href="./NOTICE.md"><img alt="Japanese word list: CC BY-SA 4.0" src="https://img.shields.io/badge/Japanese%20words-CC%20BY--SA%204.0-b5452c"></a>
  <img alt="No dependencies" src="https://img.shields.io/badge/dependencies-0-2f5d4a">
  <img alt="TypeScript" src="https://img.shields.io/badge/types-TypeScript-3178c6">
</p>

<p align="center"><a href="https://johnmorrisdotca.github.io/kumimoji/"><strong>Play a game →</strong></a></p>

<p align="center">
  <img src="docs/desktop.jpg" alt="An English game half way: a crossword on the green table, a hand of tiles under it, and the buttons to draw, trade and sort" width="720">
  <img src="docs/phone.jpg" alt="A game in Japanese kana on a phone in dark mode" width="220">
</p>

A word game engine for the race to build a crossword. Every player lays their
own tiles as words that cross, draws another when the hand is used and every
run is a word, and the first to use the last tile wins. Play alone against
the clock, or at a table of two to eight sharing one bag.

- **What is different.** A game is dealt from a seed by laying a crossword
  first, so every bag can be finished and two players racing a seed get the
  same tiles in the same order. It plays in Japanese as well as English, on
  45 kana tiles. And a finished grid is checked in time proportional to its
  size, so a server can check every game handed in.
- **What it costs a project.** No dependencies. The word lists are large, and
  are fetched only when a game first needs them.

> **The word lists have licences of their own.** The code is MIT. The English
> list is from SCOWL, under a permissive licence whose notice must travel with
> the list. **The Japanese list is derived from JMdict and is under
> [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/): attribution
> and share-alike.** If you pass the Japanese list on, or a list made from it,
> you must credit JMdict and the EDRDG and share it under the same licence.
> [The word lists and their licences](#the-word-lists-and-their-licences) has
> the whole of it, and [NOTICE.md](./NOTICE.md) the notices themselves.

## Play in 30 seconds

```sh
npm install @johnmorrisdotca/kumimoji    # or pnpm add, or yarn add
```

```ts
import "@johnmorrisdotca/kumimoji/words";   // on a server or in a script: reads the lists from this package's files
import { deal, draw, generateKumimoji, isFinished, judgeWithWords, loadTileWords, mayDraw, placeFromHand, squareAt } from "@johnmorrisdotca/kumimoji";

const words = await loadTileWords("english");
const dealt = generateKumimoji(3, "hard", 44);   // a hand of three, no wild tiles, seed 44: the smallest game there is
dealt.givens; // → "nwosy"

let play = deal(dealt.givens, 3);
play.hand; // → ["n", "w", "o"]
play = placeFromHand(play, 0, squareAt(0, 0));   // N
play = placeFromHand(play, 1, squareAt(0, 1));   // O
play = placeFromHand(play, 0, squareAt(0, 2));   // W

mayDraw(play, judgeWithWords(play.tiles, words)); // → true
play = placeFromHand(draw(play), 0, squareAt(0, -1));   // S, in front: the table has no edges
play = placeFromHand(draw(play), 0, squareAt(0, 3));    // Y
isFinished(play, judgeWithWords(play.tiles, words)); // → true
```

NOW, then SNOW, then SNOWY. And a table to play on, in a page:

```js
import { mountKumimoji } from "@johnmorrisdotca/kumimoji/ui";

mountKumimoji(document.getElementById("table"), { language: "english", hand: 7 });
```

Or with nothing to install, [play a game in the demo](https://johnmorrisdotca.github.io/kumimoji/).

## Who it is for

- **Games sites and apps.** A finished word game to put on a page: the table
  in one call, or the rules under a board of your own.
- **Anybody building a tile word game.** Dealing, laying, wild tiles, trades,
  judging a grid, a table of players with a last round, and a computer player,
  all tested.
- **Races and daily puzzles.** A seed deals one bag, the same for everybody,
  and `checkKumimoji` checks a finished grid against it without searching.
- **Japanese.** A word game that plays in kana, with が on the か tile and ゃ
  on the や tile, and a list of 163,461 readings.
- **Learners and teachers** of English or Japanese spelling.

## Use it in your project

Kumimoji is four things, each usable without the others: **the rules**, plain
functions over plain values; **the word lists**, loaded when first needed;
**a table** you mount into any element; and **React components**.

### 1. The API alone

```ts
import "@johnmorrisdotca/kumimoji/words";
import { checkKumimoji, decodeGrid, encodeGrid, judgeWithWords, loadTileWords, runsOf } from "@johnmorrisdotca/kumimoji";

const words = await loadTileWords("english");
const tiles = decodeGrid("cat/2o/2w")!;          // CAT across, and down from its T
runsOf(tiles).map((run) => run.word); // → ["cat", "tow"]
judgeWithWords(tiles, words).sound; // → true

const wrong = decodeGrid("cat/2x")!;
judgeWithWords(wrong, words).notWords; // → ["tx"]

checkKumimoji(3, "nwosy", "snowy", { level: "hard" }); // → { ok: true }
checkKumimoji(3, "nwosy", "snows", { level: "hard" }); // → { ok: false, reason: "the grid does not use exactly the tiles of the bag" }
encodeGrid(tiles); // → "cat/2o/2w"
```

### 2. The table, in plain HTML

```html
<div id="table"></div>
<p id="left"></p>
<script type="module">
  import { mountKumimoji } from "@johnmorrisdotca/kumimoji/ui";

  mountKumimoji(document.getElementById("table"), {
    language: "english",
    hand: 7,
    onChange: ({ play }) => (document.getElementById("left").textContent = play.hand.length),
  });
</script>
```

Without a bundler, import from the files as they are published:
`./node_modules/@johnmorrisdotca/kumimoji/dist/ui.js`, or a copy of `dist/`.

### 3. React

```jsx
import { useState } from "react";
import { KumimojiTable } from "@johnmorrisdotca/kumimoji/react";

export function App() {
  const [left, setLeft] = useState("");
  return (
    <>
      <KumimojiTable language="english" hand={7} onChange={({ play }) => setLeft(play.hand.length)} />
      <p id="left">{left}</p>
    </>
  );
}
```

`KumimojiTable` takes the table's options as props, plus any attribute for its
`<div>`. It mounts in the browser after the first render, so server rendering
draws an empty box and nothing needs a provider. In Next.js, use it from a
client component (`"use client"`). `KumimojiBoard` is the grid alone, for a
table of your own: see [The React components](#the-react-components).

### 4. Vue

```vue
<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";
import { mountKumimoji } from "@johnmorrisdotca/kumimoji/ui";

const box = ref(null);
const left = ref("");
let table;
onMounted(() => {
  table = mountKumimoji(box.value, { language: "english", hand: 7, onChange: ({ play }) => (left.value = play.hand.length) });
});
onBeforeUnmount(() => table?.destroy());
</script>

<template>
  <div ref="box"></div>
  <p id="left">{{ left }}</p>
</template>
```

### 5. Svelte

```svelte
<script>
  import { onMount } from "svelte";
  import { mountKumimoji } from "@johnmorrisdotca/kumimoji/ui";

  let box;
  let left = $state("");
  onMount(() => {
    const table = mountKumimoji(box, { language: "english", hand: 7, onChange: ({ play }) => (left = play.hand.length) });
    return () => table.destroy();
  });
</script>

<div bind:this={box}></div>
<p id="left">{left}</p>
```

### 6. Angular

```typescript
import { Component, ElementRef, OnDestroy, afterNextRender, provideZonelessChangeDetection, signal, viewChild } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { mountKumimoji, type KumimojiTableHandle } from "@johnmorrisdotca/kumimoji/ui";

@Component({
  selector: "app-root",
  template: `<div #box></div><p id="left">{{ left() }}</p>`,
})
class App implements OnDestroy {
  private box = viewChild.required<ElementRef<HTMLElement>>("box");
  private table?: KumimojiTableHandle;
  left = signal("");
  constructor() {
    afterNextRender(() => {
      this.table = mountKumimoji(this.box().nativeElement, { language: "english", hand: 7, onChange: ({ play }) => this.left.set(String(play.hand.length)) });
    });
  }
  ngOnDestroy() {
    this.table?.destroy();
  }
}

bootstrapApplication(App, { providers: [provideZonelessChangeDetection()] });
```

Each of the five is taken from this page as it is written, built from the
packed tarball in a project of its own, and played by taps in Chromium and
WebKit, by `scripts/check-frameworks.mjs`, before a release names it. In each
the bundler splits the word lists into files of their own, which the browser
fetches when a game is first dealt.

### What a developer gets

- **Typed results.** TypeScript types for everything, with a doc comment on
  every export, which a test holds.
- **A game you can keep.** `kumimojiToJSON` and `kumimojiFromJSON`, and plain
  text; what is read back is dealt again from its seed and checked against
  its bag, never trusted.
- **No dependencies**, ES modules, a `default` export condition so that
  `require()` loads it too (Node 22 and later).
- **Sizes.** The rules, the computer player and the table of players are
  about 44 kB minified (16 kB gzipped); the table for a page is 34 kB (13 kB).
  The English list is 606 kB (277 kB gzipped) and the Japanese 718 kB
  (396 kB), each a file of its own that is fetched only when a game in that
  language is first dealt.
- **Where it runs.** Current Chrome, Edge, Firefox and Safari, on a desk or a
  phone. The rules have no DOM in them and run in Node 20 and later, Deno,
  Bun and web workers.

## The name

*Kumimoji* (組み文字) is made of *kumi* (組み, from 組む, to put together or
assemble) and *moji* (文字, a letter or character): letters put together,
which is what a player does with the tiles. Say it in four even beats:
ku-mi-mo-ji. In Japanese printing the same word names something else, several
characters set together in the space of one; the game borrows only its plain
sense.

## Where it comes from, and where it is used

Kumimoji was built for [Itsutsu](https://itsutsu.com), a site for board games,
puzzles, card games and dice games played at your own pace. *Itsutsu* (五つ) is
Japanese for "five", after five in a row, the game the site began with. It is
[the Kumimoji played there](https://itsutsu.com/games/kumimoji): alone, in
races, round one device and across several.

### Used by

- [Itsutsu](https://itsutsu.com), for its game of Kumimoji: its rules, its
  word lists and its computer player.

That is the whole list so far. Using Kumimoji in something? Open an
[*Add my project*](https://github.com/johnmorrisdotca/kumimoji/issues/new?template=add-my-project.md)
issue and we will add you.

### The family

Kumimoji has siblings, each made for the same site, each MIT, each at
[github.com/johnmorrisdotca](https://github.com/johnmorrisdotca):

- [Korokoro](https://github.com/johnmorrisdotca/korokoro) (コロコロ, the sound
  of something small rolling along): a dice roller and a dice notation
  parser, with the exact odds of every roll.
- [Kyuubu](https://github.com/johnmorrisdotca/kyuubu) (キューブ, how Japanese
  says "cube"): a turning cube for the browser, 2×2 to 7×7, drawn in CSS 3D.
- [Hitotsu](https://github.com/johnmorrisdotca/hitotsu) (一つ, "one"): a
  colour-card game, named for the call a player makes with one card left.
- [Toranpu](https://github.com/johnmorrisdotca/toranpu) (トランプ, the everyday
  Japanese word for a deck of playing cards): ten card games, complete, with a
  computer for every seat.
- [Tane](https://github.com/johnmorrisdotca/tane) (種, a seed, the kind you
  plant): seeded random numbers and daily seeds.
- [Narabe](https://github.com/johnmorrisdotca/narabe) (並べ, "line them up"):
  a rules engine for forty-eight board games, from five in a row to Go.
- [Tenka](https://github.com/johnmorrisdotca/tenka) (天下, "all under
  heaven"): world conquest for two to six, on a map of the real world.

## Features

- **Dealt from a seed.** `generateKumimoji` lays a crossword first and deals
  its tiles, so every bag can be finished.
- **English and Japanese.** 144 tiles in each: the English letters, or 45 base
  kana where が plays as か, ゃ as や and を as お. 110,316 English words and
  163,461 Japanese readings, of 2 to 15 tiles.
- **Wild tiles** that take any letter or kana, and are read as that in every
  word they are part of.
- **Trades.** A tile you cannot use goes back into the bag for three.
- **Diagonals**, if chosen: every diagonal run of three or more must be a word
  too.
- **Three lengths.** A short game, half the set, or all 144 tiles; and two
  English sets at once.
- **The rules as plain functions.** A game in progress is a value (`TilePlay`):
  `deal`, `placeFromHand`, `moveOnTable`, `liftToHand`, `draw` and `trade` each
  return a new one.
- **A table of two to eight** sharing one bag, with a last round, resigning,
  joining and leaving, kept as text, and a computer player for any seat.
- **Help**, if chosen: the words the hand's own tiles spell.
- **A table to play on.** `mountKumimoji` plays a whole game alone in plain
  DOM, saves it and loads it back; `KumimojiBoard` draws a grid in React.
- **The table's words in English and Japanese**, and any other language by a
  table of your own. **Themeable**: every colour is a CSS variable.

## How to play

1. Everyone starts with a hand of tiles from the bag: 7 or 11.
2. Lay your tiles on the table as a crossword of your own. Every run of two or
   more tiles, across and down, must be a word, and every tile must join the
   one crossword. Move tiles and take them back as often as you like.
3. When your hand is empty and the crossword is sound, draw the next tile. At
   a table, everyone draws together.
4. Stuck with a tile you cannot use? Trade it for three from the bag.
5. A wild tile is any letter or kana you give it, and reads as that in every
   word it is part of.
6. Near the end of the bag, a player who lays their last tile in a sound
   crossword goes out. Everyone else has one last turn to do the same, and all
   who go out win. Alone, you use every tile in the bag and race the clock.

| Rule | Value | Constant |
| --- | --- | --- |
| Tiles in a set | 144 | `TILE_MIX`, `TILE_MIX_TOTAL`, `JAPANESE_TILE_MIX` |
| Opening hands | 7 or 11 (and 3, for tests and examples) | `KUMIMOJI_HANDS` |
| Tiles in a short game, for a hand of 3, 7, 11 | 5, 40, 50 | `KUMIMOJI_BAG`, `kumimojiTileCount` |
| Wild tiles in a short game of 40, at easy, medium, hard | 6, 3, 0 | `KUMIMOJI_WILDS`, `kumimojiWildCount` |
| A draw | 1 tile | `KUMIMOJI_DRAW` |
| A trade | 1 tile back for 3 | `KUMIMOJI_TRADE` |
| A diagonal run is read from | 3 tiles | `DIAGONAL_RUN_LEAST` |
| Players at a table | 2 to 8 | `KUMIMOJI_PARTY` |
| Points for a finished game | 10 a tile, and up to as much again for speed | `KUMIMOJI_SCORE`, `kumimojiPoints` |

### Dealing a game

`generateKumimoji(hand, level, seed, options?)` takes a hand of 3, 7 or 11; a
level of `"easy"`, `"medium"` or `"hard"` (the most wild tiles, some, none);
and the options `language` (`"english"` or `"japanese"`), `gameLength`
(`"short"`, `"medium"`, or `"full"`, the whole set), `doubleSet` (two English
sets) and `diagonals`. It returns a `KumimojiDeal`: the bag as `givens`, one
character a tile in the order they come out, and one finished grid as
`solution`, which proves the bag can be finished and is never shown.

```ts
import "@johnmorrisdotca/kumimoji/words";
import { deal, generateKumimoji, loadTileWords, tilesLeft, wordsInHand } from "@johnmorrisdotca/kumimoji";

const words = await loadTileWords("english");
const dealt = generateKumimoji(7, "medium", 2026);
dealt.givens.length; // → 40
dealt.givens.slice(0, 7); // → "xbsnnny"
[...dealt.givens].filter((tile) => tile === "*").length; // → 3

const play = deal(dealt.givens, 7);
tilesLeft(play); // → 33
wordsInHand(play.hand, words); // → ["by"]
```

### Tiles, squares and grids

- **A square** is a string key, `squareAt(row, col)`, and `placeOf(square)`
  reads it back. Rows and columns are any whole numbers: the table has no
  edges.
- **A tile** is one character. An English letter is itself; `*` is a wild with
  no letter; a capital is a wild given that letter (`assignHandTile`). A kana
  is a private-use character, its place in `BASE_KANA` above
  `KANA_TILE_START`, or above `KANA_WILD_START` for a wild given that kana.
  `tileFace(tile)` says what is printed on any of them, and
  the loaded list's `glyphOf`, `wordOf` and `wildFor` turn tiles into words
  and back.
- **A grid** is a `Map` from square to tile. `encodeGrid` writes it as a
  string drawn from its own top-left tile, `cat/2o/2w`, and `decodeGrid` reads
  that back.

### Playing

| Move | What it does |
| --- | --- |
| `deal(bag, handSize)` | The opening hand, and an empty table |
| `placeFromHand(play, handAt, square)` | A tile from the hand onto an empty square |
| `swapWithHand(play, handAt, square)` | A tile from the hand onto a square that holds one: they change places |
| `moveOnTable(play, from, to)` | A tile on the table to another square |
| `liftToHand(play, square)`, `liftAll(play)` | A tile, or every tile, back to the hand |
| `assignHandTile(play, handAt, face)`, `assignTableTile(play, square, face)` | Give a wild its letter or kana |
| `sortHand(play)` | The hand in order, wilds last |
| `draw(play)` | The next tile out of the bag; `mayDraw(play, verdict)` says whether it may be pressed |
| `trade(play, handAt)` | One tile back for three; `mayTrade(play)` says whether the bag has them |
| `isFinished(play, verdict)` | The bag empty, the hand used, every run a word in one piece |

Each returns a new `TilePlay` and leaves the one it was given alone.

### Japanese

```ts
import "@johnmorrisdotca/kumimoji/words";
import { BASE_KANA, deal, generateKumimoji, loadTileWords, tileKana } from "@johnmorrisdotca/kumimoji";

const words = await loadTileWords("japanese");
[...BASE_KANA].length; // → 45
[tileKana("が"), tileKana("ゃ"), tileKana("を"), tileKana("っ")]; // → ["か", "や", "お", "つ"]
words.allowed.size; // → 163461
words.allowed.has("ことは"); // → true

const dealt = generateKumimoji(7, "medium", 2026, { language: "japanese" });
deal(dealt.givens, 7).hand.map(words.glyphOf).join(""); // → "よきめたんえら"
```

The tiles are the 45 base hiragana. A word is spelt with the base of each of
its kana, so ことば is played, and listed, as ことは: a tile shows the other
forms it plays as in its corner (`CORNER_FORMS`, `formsOfTile`).

### A table of players

```ts
import "@johnmorrisdotca/kumimoji/words";
import { decodeParty, encodeParty, endTurn, generateKumimoji, handCanSpell, judgeWithWords, loadTileWords, nameOf, placeFromHand, seatPlay, squareAt, startParty, withSeatPlay } from "@johnmorrisdotca/kumimoji";

const words = await loadTileWords("english");
const settings = { size: 7, level: "medium", seed: 2026, gameLength: "short", language: "english", doubleSet: false, diagonals: false, hints: false } as const;
const dealt = generateKumimoji(settings.size, settings.level, settings.seed);

let game = startParty(settings, dealt.givens, ["Ann", { name: "Computer 1", computer: true }]);
game.players.map((player) => player.hand.length); // → [7, 7]
nameOf(game, game.turn); // → "Ann"

// The player to move plays their own hand and table as a TilePlay:
game = withSeatPlay(game, placeFromHand(seatPlay(game), 1, squareAt(0, 0)));
game = withSeatPlay(game, placeFromHand(seatPlay(game), 5, squareAt(0, 1)));
const verdict = judgeWithWords(seatPlay(game).tiles, words);
verdict.sound; // → true
game = endTurn(game, verdict, (hand) => handCanSpell(hand, words));
nameOf(game, game.turn); // → "Computer 1"

decodeParty(encodeParty(game), words.familyKey)!.turn; // → 1
```

Ann lays BY and ends her turn. `afterComputerTurn(game, words)` plays a
computer seat's whole turn, and `planComputerTurn` lists its steps, for a page
to show them one at a time. `encodeParty` keeps a table as text, and
`decodeParty` reads it back, checking every tile held against the bag.

## Keeping a game, export and import

A game alone is kept as how it was set up, its seed, and where the player has
got to; never the bag, which the seed deals again.

```ts
import "@johnmorrisdotca/kumimoji/words";
import { KUMIMOJI_STRINGS, deal, draw, encodeGrid, generateKumimoji, kumimojiFromJSON, kumimojiToJSON, kumimojiToText, loadTileWords, placeFromHand, squareAt } from "@johnmorrisdotca/kumimoji";

await loadTileWords("english");
const dealt = generateKumimoji(3, "hard", 44);
let play = deal(dealt.givens, 3);
play = placeFromHand(play, 0, squareAt(0, 0));
play = placeFromHand(play, 1, squareAt(0, 1));
play = placeFromHand(play, 0, squareAt(0, 2));
play = placeFromHand(draw(play), 0, squareAt(0, -1));
const saved = { deal: dealt, play, elapsedMs: 65_000 };

const text = kumimojiToJSON(saved);
JSON.parse(text).progress; // → "4:::snow"
const back = await kumimojiFromJSON(text);
encodeGrid(back!.play.tiles); // → "snow"
back!.play.bag; // → "nwosy"

await kumimojiFromJSON(text.replace("4:::snow", "4:::snob")); // → null
await kumimojiFromJSON("not a game"); // → null

kumimojiToText(saved); // → "Kumimoji: English, a hand of 3, seed 44\nS N O W\nHand: empty\nIn the bag: 1\nTime: 1:05\n"
kumimojiToText(saved, KUMIMOJI_STRINGS.ja).split("\n")[0]; // → "組み文字: 英語、手札3枚、シード 44"
```

The JSON, as `kumimojiToJSON` writes it:

```json
{
  "format": 1,
  "game": "kumimoji",
  "generator": "kumimoji 1.1.0",
  "size": 3,
  "level": "hard",
  "seed": 44,
  "language": "english",
  "gameLength": "short",
  "doubleSet": false,
  "diagonals": false,
  "progress": "4:::snow",
  "elapsedMs": 65000
}
```

- **The JSON reads back in, and nothing in it is trusted.** `kumimojiFromJSON`
  deals the bag again from the seed, and opens the game only if every tile in
  the hand and on the table is one that came out of that bag and was not
  given back. A B nobody drew, a later `format`, another game's file or
  anything that is not JSON resolves to `null`. It is a promise because it
  loads the word list of the game's language first.
- **`format`** is `KUMIMOJI_EXPORT_FORMAT`, and goes up only when a reader of
  the old shape would be wrong about the new one.
- **`progress`** is what `encodeTileProgress` writes: how many tiles have been
  taken, the tiles traded back, the hand in its order, and the grid
  (`encodeGrid`), with colons between. `decodeTileProgress(progress, bag,
  language)` reads it against a bag.
- **The text** is the crossword as it lies, for a chat or a note:
  `gridToText(tiles, language)` alone is the grid, English letters spaced with
  a dot for an empty square, kana side by side with a full-width dot.
- **There is no CSV.** A crossword is not a table of rows, and a spreadsheet
  has nothing to do with one.
- **A table of players** is kept by `encodeParty` and read by `decodeParty`,
  as above.
- **In the table** it is *Save and load*, under the buttons: save as JSON or
  as text, and load a saved game back, its clock going on from where it was.

## The word lists and their licences

**The code of this package is MIT. The two word lists are other people's
work, under their own terms**, and [NOTICE.md](./NOTICE.md) sets the notices
out in full. It is shipped in the package, and each list's own file opens
with its notice too.

| List | What it is | Where it comes from | Terms |
| --- | --- | --- | --- |
| English, `dist/words.en.data.js` | 110,316 words of 2 to 15 letters, English and American spellings | [SCOWL](http://wordlist.aspell.net/) 2020.12.07, sizes 10 to 70 | © 2000–2018 Kevin Atkinson and the authors of the lists SCOWL is built from. Permission to use, copy, modify, distribute and sell for any purpose, **provided the copyright notice appears in all copies, and both it and the permission notice in supporting documentation**. No share-alike. |
| Japanese, `dist/words.ja.data.js` | 163,461 hiragana readings of 2 to 15 kana, each spelt in the 45 base kana of the tiles | [JMdict](https://www.edrdg.org/jmdict/j_jmdict.html), release 2026-09-28, of the Electronic Dictionary Research and Development Group | **[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)**, with the [EDRDG's conditions](https://www.edrdg.org/edrdg/licence.html). **Attribution is required, and the list, or anything made from it, may be passed on only under the same licence.** |

What that means for a project that uses this package:

- **Using the package in a site or an app**, MIT code and all, asks for the
  notices: keep `NOTICE.md` with the package, and where your project lists its
  credits, credit SCOWL, and JMdict and the EDRDG.
- **The Japanese list is share-alike.** If you copy it, change it, or make a
  list of your own from it, and pass that on, it stays under CC BY-SA 4.0 and
  says where it came from. The code stays MIT.
- **If you need only one list**, load only that one: each is a file of its
  own, nothing else in the package carries a word, and a page fetches a list
  only when it deals a game in that language.

This is a description, not legal advice; the licences themselves are what
hold.

### Loading them

In a browser, `loadTileWords(language)` fetches the list as its own module
the first time it is needed, so no page carries it that does not deal a game.
On a server, in a test or in a script there is no browser to fetch it, and the
`words` entry reads the lists from this package's files instead. Import it
once, before anything that deals or judges:

```ts
import "@johnmorrisdotca/kumimoji/words";
import { loadTileWords, tileWords, tileWordsReady } from "@johnmorrisdotca/kumimoji";

const words = await loadTileWords("english");
tileWordsReady("english"); // → true
words.allowed.size; // → 110316
words.allowed.has("crossword"); // → true
words.allowed.has("kumimoji"); // → false
tileWords("english") === words; // → true
```

`tileWords(language)` hands back the list already loaded, and throws where it
has not been: a check that cannot read the list must not answer. A `TileWords`
has `allowed` (every word), `byLength`, the tile `mix`, and the functions that
turn tiles into words: `glyphOf`, `soundOf`, `wordOf`, `wildFor`, `isWild`,
`wildSound`, `inventoryKey`, `familyKey`, `formsOf`, `wildOptions` and
`codeOf`.

## API

Every function, type and constant has a doc comment, so an editor shows this
as you type. The entries:

| Entry | What it holds |
| --- | --- |
| `@johnmorrisdotca/kumimoji` | Dealing, playing, judging, the table of players, the computer player, keeping and export, and the table's words |
| `@johnmorrisdotca/kumimoji/words` | Reads both word lists from this package's files, for a server, a test or a script: `loadTileWordsFromModule` |
| `@johnmorrisdotca/kumimoji/ui` | `mountKumimoji`, a whole game alone in plain DOM, and `boardModel` |
| `@johnmorrisdotca/kumimoji/react` | `KumimojiBoard` and `KumimojiTable` |

### Dealing and judging

| Export | What it does |
| --- | --- |
| `generateKumimoji(hand, level, seed, options?)` | A game dealt from a seed: the bag, and one grid that finishes it |
| `judgeWithWords(tiles, words, rules?)` | What is wrong with a grid: the tiles in runs that are not words, the tiles apart, and whether it is sound |
| `judgeGrid(tiles, isWord, readable?, rules?)` | The same against any test of a word |
| `runsOf(tiles, rules?)`, `groupsOf(tiles, links?)` | Every run the grid is read by; the tiles in groups that touch |
| `checkKumimoji(size, givens, answer, options?)` | Whether a grid finishes a game: the one check a server runs |
| `kumimojiPoints(givens, elapsedMs)` | A finished game's points |
| `readWilds(tiles, words, rules?)`, `WILD_SEARCH_MOST` | A grid with each wild that has no letter read as the one that makes its runs words, or `null`; and how far it looks before giving up |
| `wordsInHand(hand, words)`, `handSpelling(play, word)` | Help: the words a hand spells, and the hand arranged as one |
| `crossingFit`, `diagonalsRead` | Where a word may be laid crossing a tile, and the diagonal runs a new tile would make, for a generator or a computer player |
| `seededRandom(seed)`, `shuffled(items, random)` | The seeded random a deal is drawn from |

### Tiles and grids

| Export | What it does |
| --- | --- |
| `squareAt(row, col)`, `placeOf(square)` | A square's key, and back |
| `encodeGrid(tiles)`, `decodeGrid(code)`, `boundsOf(tiles)` | A grid as a string, and back; the rows and columns it stands within |
| `lettersOf(letters)`, `sameLetters(a, b)` | How many of each tile, and whether two tallies match |
| `tileFace(tile)`, `tileDescription(tile)`, `kanaTileCode(kana, wild?)` | What a tile shows; what a screen reader says; a kana's tile |
| `tileKana(kana)`, `BASE_KANA`, `CORNER_FORMS`, `formsOfTile(kana)` | The tile a kana is played with, the 45 tiles, and the forms each plays as |
| `familyKeyOf(language)` | Which tile of the set a code is, without the word list |
| `loadTileWords`, `tileWords`, `tileWordsReady` | The word list: fetched, handed back, asked after |
| `unpackTileWords`, `unpackLength`, `tileWordsFrom`, `readTileWordsWith` | How a list is read from its packed data, for the loader |
| `mixShown(language)`, `lengthRows(hand?)`, `LENGTHS`, `TRY_IT` | A set and the lengths of game as a page shows them |

### Playing, and a game kept

The moves are in [Playing](#playing) above. With them:

| Export | What it does |
| --- | --- |
| `tilesLeft(play)` | How many tiles are still in the bag |
| `encodeTileProgress(play)`, `readTileProgress(code)`, `decodeTileProgress(code, bag, language?)` | A game half way as one string; its shape read; and opened again on its own bag |
| `kumimojiToJSON(saved)`, `kumimojiFromJSON(text)`, `kumimojiExported(saved)` | A game as JSON, and back, or `null` |
| `kumimojiToText(saved, strings?)`, `gridToText(tiles, language?)`, `kumimojiClock(ms)` | A game, a grid and a time as text |
| `KUMIMOJI_EXPORT_FORMAT`, `KUMIMOJI_VERSION` | The JSON's format number, and this package's version |
| `KUMIMOJI_STRINGS`, `kumimojiStrings(locale, own?)`, `kumimojiSay(line, values)` | The table's words in English and Japanese |

### A table of players

| Export | What it does |
| --- | --- |
| `startParty(settings, bag, seats)` | A table dealt: two to eight seats, each a name or `{ name, computer }` |
| `seatPlay(game)`, `withSeatPlay(game, play)` | The player to move's hand and table as a `TilePlay`, and the game with it put back |
| `endTurn(game, verdict, handSpells)`, `doneRefused(…)` | End the turn; why Done is refused, if it is |
| `drawAll(game)`, `mayDrawAll(game, verdict)` | Everyone draws together |
| `resign(game)`, `mayResign(game)` | Give up the game |
| `joinParty(game, seat)`, `joinRefused(game)`, `leaveParty(game, at)`, `leaveRefused(game, at)` | Joining and leaving a game under way |
| `isOver(game)`, `winnersOf(game)`, `goesOut(game, verdict)`, `isLastTurn(game)`, `lastStanding(game)` | How the game stands and ends |
| `mayTradeThisTurn(game)`, `mustTradeFirst(game, handSpells)`, `laidThisTurn(game)`, `handCanSpell(hand, words)` | What this turn may and must do |
| `nameOf(game, at)`, `tidyName(name)`, `computerName(players)`, `isComputer(game, at)` | Names, and whether a seat is a computer's |
| `stillIn(game)`, `nextIn(game, from)`, `partyTilesLeft(game)`, `tilesHeldBy(game, at)`, `tableTally(tiles)` | Who is in, whose turn is next, and the tiles |
| `partyTilesNeeded`, `partyFits`, `partyLength`, `partyPlayersAsked` | Whether a bag is big enough for a table, for a set-up screen |
| `passViewStart(game)`, `stepView(game, from, by)` | Whose table a shared screen shows |
| `encodeParty(game)`, `decodeParty(code, familyKey?)`, `readSettings(value)`, `holdsItsBag(game, familyKey)`, `isPartyFor` | A table kept as text, read back and checked, and matched to the set-up it was dealt for |
| `afterComputerTurn(game, words)`, `planComputerTurn(game, words)`, `COMPUTER_STEPS_MOST` | A computer seat's turn, whole or step by step |
| `bestLaying(play, words, rules?)`, `tradeChoice(hand, words)`, `judgeTiles(tiles, words, rules?)` | What the computer would lay, and trade |

### Looking at the table

A table with no edges is looked at through a view, which the package keeps
apart from the game: `tableArea`, `fitView`, `fittedMost`, `zoomView`,
`panView`, `keepInReach`, `overflows`, `squareUnder`, `edgePan` and the
numbers in `TABLE`. A player may turn the table a quarter at a time with every
tile kept upright: `nextTurn`, `turnPlace`, `unturnPlace`, `turnArea`,
`turnView`, `typingWay` and `arrowStep`.

The types are `TilePlay`, `Tiles`, `GridVerdict`, `GridRules`, `Run`,
`RunLine`, `Bounds`, `Square`, `CrossingFit`, `KumimojiDeal`,
`KumimojiOptions`, `KumimojiCheck`, `KumimojiLevel`, `KumimojiLength`,
`KumimojiLanguage`, `TileWords`, `TileFaceOf`, `PartyGame`, `PartySettings`,
`PartyPlayer`, `PartySeat`, `PartyEnding`, `JoinRefusal`, `LeaveRefusal`,
`ComputerStep`, `ComputerSaid`, `KumimojiSaved`, `KumimojiExported`, `KumimojiStrings`,
`KumimojiLocale`, `Random`, `Turn`, `Area`, `View`, `MixTile`, `MixShown` and
`LengthRow`.

### The table

`mountKumimoji(element, options?)` from `@johnmorrisdotca/kumimoji/ui` deals
and plays a whole game alone in the element, and returns a handle.

| Option | Default | What it does |
| --- | --- | --- |
| `language` | `"english"` | The language of the tiles: `"english"` or `"japanese"` |
| `hand` | `7` | The opening hand: 3, 7 or 11 tiles |
| `level` | `"medium"` | Wild tiles: `"easy"` the most, `"medium"` some, `"hard"` none |
| `gameLength` | `"short"` | `"short"`, `"medium"`, or `"full"`, all 144 tiles |
| `diagonals` | `false` | Every diagonal run of three or more must be a word too |
| `seed` | a new one each game | The seed the bag is dealt from |
| `onFinish` | | Called when the last tile is laid and every run is a word, with the time it took |
| `onChange` | | Called after every change, with the game as it would be saved |
| `locale` | the page's `lang` | The language of the table's words: `"en"` or `"ja"` |
| `strings` | | Words of your own, laid over the locale's |
| `theme` | | CSS variables set on the table itself |
| `keep` | `true` | Whether the table offers saving and loading |

| Handle | What it does |
| --- | --- |
| `play()` | The game as it stands, or `null` while it is being dealt |
| `saved()` | The game as it would be saved, or `null` while it is being dealt |
| `newGame(options?)` | A new game; any of the first six options may change |
| `setGame(saved)` | Put a game on the table: one read back by `kumimojiFromJSON` |
| `setLocale(locale, strings?)` | Change the language of the table's words |
| `destroy()` | Take the table off the page and stop its clock |

To play it: tap a tile in your hand and then a square to lay it; tap a tile on
the table and then a square to move it, or tap it again to take it back. A
wild is given its letter before it is laid. To draw a board yourself, the same
entry has `boardModel(tiles, verdict, glyphOf?)`, which works out the squares
to draw and how each tile stands, with `BOARD_MARGIN` and `BOARD_LEAST`, and
`KUMIMOJI_STYLE`, the table's stylesheet as a string.

### The React components

```jsx
import { useEffect, useState } from "react";
import { deal, generateKumimoji, judgeWithWords, liftToHand, loadTileWords, placeFromHand } from "@johnmorrisdotca/kumimoji";
import { KumimojiBoard } from "@johnmorrisdotca/kumimoji/react";

export function Board() {
  const [words, setWords] = useState(null);
  const [play, setPlay] = useState(null);
  useEffect(() => {
    void loadTileWords("english").then((loaded) => {
      setWords(loaded);
      setPlay(deal(generateKumimoji(7, "hard", 2026).givens, 7));
    });
  }, []);
  if (words === null || play === null) return <p>Dealing…</p>;
  // A press on an empty square lays the first tile of the hand there; a press on a tile takes it back.
  const press = (square) => setPlay(play.tiles.has(square) ? liftToHand(play, square) : play.hand.length > 0 ? placeFromHand(play, 0, square) : play);
  return <KumimojiBoard tiles={play.tiles} verdict={judgeWithWords(play.tiles, words)} glyphOf={words.glyphOf} onSquare={press} square={44} />;
}
```

| `KumimojiBoard` prop | What it does |
| --- | --- |
| `tiles` | The tiles on the table: `play.tiles` |
| `verdict` | From `judgeWithWords`: rings the runs that are not words and fades the tiles apart |
| `glyphOf` | What to print on a tile: `words.glyphOf` for the language played |
| `onSquare` | Called with a square's key when it is pressed, empty or not |
| `held` | A square to ring, such as the one holding a tile picked up |
| `square` | The side of a square in pixels; 36 by default |
| anything else | Passed to the `<div>` |

`KumimojiTable` takes every option of `mountKumimoji` as a prop, and anything
else for its `<div>`. Options are read when it mounts; give it a new `key` to
start over with different ones.

## Theming

Every colour is a CSS variable on `.km-root`. Set them in your stylesheet, on
the table's element or any ancestor, or pass them as `theme`, which sets them
on the table itself and so wins in light and dark alike.

| Variable | What it sets | Light | Dark |
| --- | --- | --- | --- |
| `--km-square` | The side of a square and of a tile | `44px` | the same |
| `--km-felt` | The table | `#2f5d4a` | `#1e3a2f` |
| `--km-grid-line` | An empty square | `rgba(255,255,255,.12)` | the same |
| `--km-tile`, `--km-tile-ink` | A tile and its letter | `#f3e6c8`, `#2a2118` | the same |
| `--km-wild` | A wild tile | `#f6d27a` | the same |
| `--km-wrong` | The ring round a run that is not a word | `#d9534f` | the same |
| `--km-held` | The ring round the tile picked up | `#ffcf3f` | the same |
| `--km-ink` | Text | `#1f2320` | `#ece8dc` |
| `--km-panel` | The hand, the buttons, and saving and loading | `#f7f3ea` | `#1d201e` |
| `--km-line` | Button edges | `rgba(20,20,20,.35)` | `rgba(255,255,255,.25)` |
| `--km-accent`, `--km-accent-ink` | The main button | `#2f5d4a`, `#fff` | `#6fb08f`, `#10150f` |
| `--km-radius` | The table's corners | `12px` | the same |
| `--km-font` | The typeface | `system-ui, …` | the same |

A slate table with ivory tiles, a little smaller:

```js
import { mountKumimoji } from "@johnmorrisdotca/kumimoji/ui";

mountKumimoji(document.getElementById("table"), {
  theme: { "--km-felt": "#23405a", "--km-tile": "#fffdf7", "--km-wild": "#d4a017", "--km-accent": "#b5452c", "--km-square": "40px" },
});
```

`KumimojiBoard` draws with colours of its own; style it through its `style`
and `className`.

## Languages

Two things here have a language, and they are chosen apart. **The tiles** are
English letters or Japanese kana: the `language` option. **The table's words**,
its buttons and status lines, are English or Japanese: `locale`, or the page's
`lang`, changed at any time with `setLocale`. An English page can play kana.

The demo has a chooser of its own, follows the browser's language on a first
visit, and takes `?lang=ja` or `?lang=en` in the address. **Japanese:
included; not yet reviewed by a native reader. Corrections welcome.** Every
Japanese string is listed beside its English in
[docs/strings-ja.md](./docs/strings-ja.md), and there is an
[issue template](https://github.com/johnmorrisdotca/kumimoji/issues/new?template=fix-a-translation.md)
for fixing one. Any other language is a table of your own passed as `strings`:

```ts
import { KUMIMOJI_STRINGS, kumimojiSay, kumimojiStrings } from "@johnmorrisdotca/kumimoji";

kumimojiSay(KUMIMOJI_STRINGS.ja.left, { n: 12, time: "1:05" }); // → "袋の残り12枚 · 1:05"
kumimojiStrings("en", { draw: "Robar" }).draw; // → "Robar"
```

A new language for the tiles is another matter: it needs a real dictionary of
that language, whose licence lets its words be shipped.

## Limits

| Limit | Value | Constant |
| --- | --- | --- |
| Opening hand | 3, 7 or 11 | `KUMIMOJI_HANDS` |
| A word | 2 to 15 tiles | |
| A finished grid, either way | 60 squares | `KUMIMOJI_GRID_MOST` |
| Players at a table | 2 to 8 | `KUMIMOJI_PARTY` |
| A player's name | 20 characters | `KUMIMOJI_PARTY` |
| Words one hand is offered as help | 40 | `HELP_WORDS_MOST` |
| A seed | a whole number from 0 to 4,294,967,295 | |
| Two sets at once | English only | |

## Browser support

Any current browser: Chrome, Edge, Firefox and Safari, on a desk or a phone.
It needs ES2020 and dynamic `import()`. The table is tested in Chromium and in
WebKit, Safari's engine, at phone size with touch and on a desktop. The rules
run in Node 20 and later, Deno, Bun and web workers, and load by `import` and
by `require()`.

## The command line

There is none, on purpose. Checking a word or seeing a deal is a few lines of
Node, and a command that did only that would be a dictionary tool, which this
package is not:

```ts
import "@johnmorrisdotca/kumimoji/words";
import { generateKumimoji, loadTileWords } from "@johnmorrisdotca/kumimoji";

const words = await loadTileWords("english");
words.allowed.has("snowy"); // → true
[...generateKumimoji(3, "hard", 44).givens].join(" "); // → "n w o s y"
```

## Roadmap

- More languages for the tiles, each from a real dictionary of that language.
- Playing the plain-DOM table from a keyboard, as the React one on Itsutsu
  can be.
- A table of players in plain DOM, beside the game alone.
- A computer player at three strengths.
- Word definitions for a finished crossword.
- A Vue wrapper and a web component, beside the React one.

Left out on purpose: play between devices, which needs a server (a table is
kept as text made to be sent, and Itsutsu sends it; the sending is yours); a
command line; CSV; and any name, art or wording of a published game. Kumimoji
runs from a static page and costs nothing to host.

Ideas and pull requests are welcome.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). In short:

```sh
pnpm install
pnpm check        # lint, types and tests
pnpm test:table   # the demo in real browsers, by taps
pnpm site         # build the demo into ./site, then serve it
```

Please follow the [code of conduct](./CODE_OF_CONDUCT.md).

## Changes

See [CHANGELOG.md](./CHANGELOG.md).

## Licence

The code is [MIT](./LICENSE) © John Morris.

The word lists are other people's work, under their own terms, set out in
[The word lists and their licences](#the-word-lists-and-their-licences) and in
full in [NOTICE.md](./NOTICE.md):

- **English**: from [SCOWL](http://wordlist.aspell.net/), © Kevin Atkinson and
  others, under a permissive licence whose notice travels with the lists.
- **Japanese**: readings derived from
  [JMdict](https://www.edrdg.org/jmdict/j_jmdict.html), © the Electronic
  Dictionary Research and Development Group, under
  [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The
  Japanese list (`src/words.ja.data.ts`, shipped as `dist/words.ja.data.js`)
  is shared under the same licence.
