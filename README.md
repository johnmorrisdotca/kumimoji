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

<p align="center"><a href="https://johnmorrisdotca.github.io/kumimoji/"><strong>Play a game →</strong></a> · <a href="https://johnmorrisdotca.github.io/kumimoji/api.html">API reference</a> · <a href="docs/API.md">The API in full</a></p>

<table align="center">
<tr>
<td align="center" valign="top">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/kumimoji/main/docs/images/hero-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/kumimoji/main/docs/images/hero-desk-light.webp" alt="The demo on a desk, in English: the page's header with its language chooser and cloth swatches, the choices for tiles, hand and wild tiles, and a green table with a crossword half built from the words SYNDIC, MAUP and PA crossing, one tile left in the hand and the buttons to draw, trade, sort and lift all." width="720">
</picture>
<br><em>An English game half way, on a desk: a crossword of SYNDIC and the words that cross it.</em>
</td>
<td align="center" valign="top">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/kumimoji/main/docs/images/hero-phone-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/kumimoji/main/docs/images/hero-phone-light.webp" alt="The demo on a phone, in Japanese kana: a green table with a crossword built from kana tiles, and a hand and buttons under it." width="220">
</picture>
<br><em>A game in kana on a phone, in the device's light or dark.</em>
</td>
</tr>
</table>

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

```js no-run
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
- **A tag.** `<kumimoji-table>` is the same game in one element, with no
  framework.
- **One bag a day.** `kumimojiDailySeed(new Date())` is the same seed for
  everybody, worldwide.
- **Played from a keyboard.** Arrow keys between squares and tiles, Enter or
  Space to pick up and lay; see [Accessibility](#accessibility).
- **The table's words in English and Japanese**, and any other language by a
  table of your own. **Themeable**: every colour is a CSS variable.

### What's in it

Each picture is the table the package draws, taken from [the demo](https://johnmorrisdotca.github.io/kumimoji/) with `pnpm screenshots:readme`, in light and dark. The game is dealt from a seed, and the words are laid by the package's own computer player, so the same pictures come again.

<table>
<tr>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/kumimoji/main/docs/images/english-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/kumimoji/main/docs/images/english-desk-light.webp" alt="An English board on the green table: SYNDIC across with MAUP and PA crossing it, and U hanging under the N, drawn on a grid of empty squares that has no edge." width="400">
</picture>
<br><em><strong>English.</strong> 144 tiles, 110,316 words.</em>
</td>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/kumimoji/main/docs/images/kana-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/kumimoji/main/docs/images/kana-desk-light.webp" alt="A Japanese board of kana tiles on the green table, a crossword of hiragana laid across and down on the grid of empty squares." width="400">
</picture>
<br><em><strong>Japanese kana.</strong> 45 base kana tiles, 163,461 readings.</em>
</td>
</tr>
<tr>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/kumimoji/main/docs/images/not-a-word-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/kumimoji/main/docs/images/not-a-word-desk-light.webp" alt="A board with two tiles side by side, N and W, each ringed in red, because the two make the run NW, which is not a word." width="400">
</picture>
<br><em><strong>A run that is not a word</strong> is ringed, and named under the table.</em>
</td>
<td align="center" valign="top" width="50%">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/kumimoji/main/docs/images/hand-of-eleven-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/kumimoji/main/docs/images/hand-of-eleven-desk-light.webp" alt="A board partly built from a hand of eleven tiles, a larger crossword than a hand of seven makes, on the same green table." width="400">
</picture>
<br><em><strong>A hand of eleven.</strong> Hands are 3, 7 or 11.</em>
</td>
</tr>
</table>

<p align="center">
<picture>
<source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/johnmorrisdotca/kumimoji/main/docs/images/wild-tiles-desk-dark.webp">
<img src="https://raw.githubusercontent.com/johnmorrisdotca/kumimoji/main/docs/images/wild-tiles-desk-light.webp" alt="A hand of seven tiles, E, T, U, P, L and L in cream and one gold tile with a black star, a wild tile that is any letter or kana the player gives it." width="500">
</picture>
<br><em><strong>A wild tile</strong> is the gold star in the hand: the player gives it a letter before it is laid.</em>
</p>

## Use it in your project

### Install

```sh
npm install @johnmorrisdotca/kumimoji
```

```sh
pnpm add @johnmorrisdotca/kumimoji
```

```sh
yarn add @johnmorrisdotca/kumimoji
```

A page with no bundler loads the table as a tag from a CDN, naming the major version so that a release that changes what you use is one you choose:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@johnmorrisdotca/kumimoji@1/dist/element-define.js"></script>
```

On a server or in a script, `import "@johnmorrisdotca/kumimoji/words"` first, so that the word lists are read from the package's files.

Kumimoji is five things, each usable without the others: **the rules**, plain
functions over plain values; **the word lists**, loaded when first needed;
**a table** you mount into any element; **the same table as a tag**,
`<kumimoji-table>`, for a page with no script of its own; and **React
components**.

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

### 3. As a tag

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@johnmorrisdotca/kumimoji@1/dist/element-define.js"></script>

<kumimoji-table language="english" hand="7" seed="2026"></kumimoji-table>
<kumimoji-table language="japanese" level="easy" seed="daily"></kumimoji-table>
```

The first is a game of English tiles dealt from a seed; the second is the
day's bag in kana. A table in a tag needs no framework and no bundler, and a
page with a framework can use it the same way. Every attribute is listed under
[The element](#the-element); the table fires `kumimoji-change` after each
change to the game and `kumimoji-finish` when it is won.

### 4. React

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

### 5. Vue

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

### 6. Svelte

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

### 7. Angular

```ts no-check
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

Each of the six is taken from this page as it is written, built from the
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
  `require()` loads it too (Node 22 and later), and a `sideEffects` list that
  names only the files that define the tag and register the word lists.
- **Sizes.** The rules, the computer player and the table of players are
  about 44 kB minified (16 kB gzipped); the table for a page is 34 kB (13 kB).
  The English list is 606 kB (277 kB gzipped) and the Japanese 718 kB
  (396 kB), each a file of its own that is fetched only when a game in that
  language is first dealt.
- **Where it runs.** Current Chrome, Edge, Firefox and Safari, on a desk or a
  phone. The rules have no DOM in them and run in Node 22 and later, Deno,
  Bun and web workers.

The cookbook, with the output of each example, is under [Examples](#examples).

## Examples

Every TypeScript and JavaScript block that can run is type-checked against the built package and run by `pnpm test:readme`, so the output after `// →` is what the code prints. The word lists are read from the package's files in Node, so nothing here uses a network.

### A page with nothing else

Save this as a file and open it. The tag is the whole table: set-up, tiles, hand, clock, saving and loading.

```html
<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>A crossword race</title>
<script type="module" src="https://cdn.jsdelivr.net/npm/@johnmorrisdotca/kumimoji@1/dist/element-define.js"></script>
<kumimoji-table language="english" hand="7" seed="daily"></kumimoji-table>
```

### Listen to the tag

The tag fires `kumimoji-change` after every change, with the game as it would be saved, and `kumimoji-finish` when the last tile is laid and every run is a word:

```html
<kumimoji-table id="game" language="japanese" hand="7" seed="2026"></kumimoji-table>
<p id="note"></p>
<script type="module">
  import "https://cdn.jsdelivr.net/npm/@johnmorrisdotca/kumimoji@1/dist/element-define.js";

  const game = document.getElementById("game");
  game.addEventListener("kumimoji-change", (event) => {
    localStorage.setItem("kumimoji", JSON.stringify(event.detail.saved));
  });
  game.addEventListener("kumimoji-finish", (event) => {
    document.getElementById("note").textContent = `Done in ${Math.round(event.detail.elapsedMs / 1000)} seconds.`;
  });
</script>
```

### Deal the day's bag

`kumimojiDailySeed(date)` is the UTC date as a number, the same for everybody on earth, and the same number as Tane's `dailySeed`. Everybody who deals from it with the same settings gets the same bag in the same order:

```ts
import "@johnmorrisdotca/kumimoji/words";
import { generateKumimoji, kumimojiDay, kumimojiDailySeed, loadTileWords } from "@johnmorrisdotca/kumimoji";

await loadTileWords("english");
const now = new Date("2026-10-06T10:00:00Z");
kumimojiDay(now); // → "2026-10-06"
kumimojiDailySeed(now); // → 20261006
const dealt = generateKumimoji(7, "medium", kumimojiDailySeed(now));
dealt.givens.length; // → 40
dealt.givens.slice(0, 10); // → "ltlekac*rm"
```

The `*` is a wild tile, which takes any letter. The bag is one character a tile, in the order the tiles come out.

### Judge a grid

`judgeWithWords(tiles, words)` says what is wrong with a grid: the tiles in runs that are not words, and the tiles standing apart from the crossword. A table draws the first as a red ring and fades the second:

```ts
import "@johnmorrisdotca/kumimoji/words";
import { decodeGrid, judgeWithWords, loadTileWords, squareAt } from "@johnmorrisdotca/kumimoji";

const words = await loadTileWords("english");
const crossword = decodeGrid("cat/2o/2w")!;
judgeWithWords(crossword, words).sound; // → true

const scattered = new Map(crossword);
scattered.set(squareAt(4, 4), "x");                  // a tile that touches nothing
const verdict = judgeWithWords(scattered, words);
verdict.sound; // → false
[...verdict.apart]; // → ["4,4"]
```

### What the computer player would lay

`bestLaying(play, words)` finds the word the computer player lays from a hand and a table, with no randomness, so a turn replays exactly after a reload:

```ts
import "@johnmorrisdotca/kumimoji/words";
import { bestLaying, deal, generateKumimoji, loadTileWords, wordsInHand } from "@johnmorrisdotca/kumimoji";

const words = await loadTileWords("english");
const play = deal(generateKumimoji(7, "hard", 2026).givens, 7);
play.hand.join(""); // → "xbsnnny"
bestLaying(play, words)?.word; // → "by"
wordsInHand(play.hand, words); // → ["by"]
```

`wordsInHand` is the same list a player is offered as help when the game was set up with it.

### A computer's turn, step by step

`planComputerTurn(game, words)` lists a computer seat's whole turn as steps, in order, for a page to show one at a time; `afterComputerTurn` is the game after all of them:

```ts
import "@johnmorrisdotca/kumimoji/words";
import { afterComputerTurn, endTurn, generateKumimoji, handCanSpell, judgeWithWords, loadTileWords, nameOf, planComputerTurn, seatPlay, startParty } from "@johnmorrisdotca/kumimoji";

const words = await loadTileWords("english");
const settings = { size: 7, level: "hard", seed: 2026, gameLength: "short", language: "english", doubleSet: false, diagonals: false, hints: false } as const;
let game = startParty(settings, generateKumimoji(7, "hard", 2026).givens, ["Ann", { name: "Computer", computer: true }]);
game = endTurn(game, judgeWithWords(seatPlay(game).tiles, words), (hand) => handCanSpell(hand, words));   // Ann passes
nameOf(game, game.turn); // → "Computer 1"

const steps = planComputerTurn(game, words);
steps.map(({ said }) => (said.kind === "laid" ? `laid ${said.word}` : said.kind)); // → ["laid enamor", "traded", "laid cate", "drew", "done"]
nameOf(afterComputerTurn(game, words), 0); // → "Ann"
```

### Points for a finished game

A finished game scores 10 a tile, and up to as much again for speed (this one is 770 points at a minute and a half, and 500 at fifteen minutes, when no speed bonus is left). A server that has checked a grid can award the same points the table shows:

```ts
import "@johnmorrisdotca/kumimoji/words";
import { generateKumimoji, kumimojiPoints, loadTileWords } from "@johnmorrisdotca/kumimoji";

await loadTileWords("english");
const dealt = generateKumimoji(7, "hard", 2026);
kumimojiPoints(dealt.givens, 90_000); // → 770
kumimojiPoints(dealt.givens, 900_000); // → 500
```

### Check a race on a server

Players racing a seed are dealt the same bag, so a server that is handed only the seed and a finished grid checks the whole game in time proportional to the grid, with no search:

```ts
import "@johnmorrisdotca/kumimoji/words";
import { checkKumimoji, generateKumimoji, loadTileWords } from "@johnmorrisdotca/kumimoji";

await loadTileWords("english");
const dealt = generateKumimoji(3, "hard", 44);
checkKumimoji(3, dealt.givens, "snowy", { level: "hard" }); // → { ok: true }
checkKumimoji(3, dealt.givens, "snows", { level: "hard" }); // → { ok: false, reason: "the grid does not use exactly the tiles of the bag" }
```

### Mount the table with options

`mountKumimoji` plays a whole game alone in one element, and hands back the game as plain data after each change:

```ts no-run
import { mountKumimoji } from "@johnmorrisdotca/kumimoji/ui";

const table = mountKumimoji(document.getElementById("table")!, {
  language: "japanese",
  hand: 11,
  level: "easy",                 // the most wild tiles
  gameLength: "medium",          // half the set
  seed: 2026,
  locale: "ja",                  // the table's own words
  onFinish: (result) => console.log("done", result),
});
await table.newGame({ language: "english", hand: 7 });   // another game, on the same table
table.destroy();
```

### A look of your own

Every colour is a CSS variable on `.km-root`, so a stylesheet or the `theme` option can restyle the table:

```ts no-run
import { mountKumimoji } from "@johnmorrisdotca/kumimoji/ui";

mountKumimoji(document.getElementById("table")!, {
  theme: { "--km-felt": "#23405a", "--km-tile": "#fffdf7", "--km-wild": "#d4a017", "--km-square": "40px" },
});
```

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

### The day's seed

| Export | What it does |
| --- | --- |
| `kumimojiDay(date)` | The day a moment falls on, in UTC, written `YYYY-MM-DD` |
| `kumimojiDailySeed(date)` | That day's seed: the date as a number, so 2026-10-01 is `20261001` |

```ts
import { kumimojiDailySeed } from "@johnmorrisdotca/kumimoji";

kumimojiDailySeed(new Date("2026-10-01T12:00:00Z")); // → 20261001
kumimojiDailySeed(new Date("2026-10-01T23:59:59Z")); // → 20261001
```

The day is the UTC date, so it changes at one moment for the whole world, and
everybody who deals from it with the same settings (language, hand, level and
length) gets the same bag in the same order. It is the same number as Tane's
`dailySeed`, so a page that uses both agrees; Kumimoji does not need Tane. The
race against the clock is each player's own.

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
  "generator": "kumimoji 1.2.2",
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

A real word the table calls "not a word", or a word it accepts that it should
not: open a [*word list*](https://github.com/johnmorrisdotca/kumimoji/issues/new?template=word-list.md)
issue. The lists are not edited by hand, so a word may have to be changed at
its source.

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

The [API reference](https://johnmorrisdotca.github.io/kumimoji/api.html) lists every export of every entry point with its signature and its doc comment. It is made from the source by `pnpm site`, so it cannot fall behind the code.

Every function, type and constant has a doc comment, so an editor shows this
as you type. The entries:

| Entry | What it holds |
| --- | --- |
| `@johnmorrisdotca/kumimoji` | Dealing, playing, judging, the table of players, the computer player, keeping and export, and the table's words |
| `@johnmorrisdotca/kumimoji/words` | Reads both word lists from this package's files, for a server, a test or a script: `loadTileWordsFromModule` |
| `@johnmorrisdotca/kumimoji/ui` | `mountKumimoji`, a whole game alone in plain DOM, and `boardModel` |
| `@johnmorrisdotca/kumimoji/element` | `KumimojiTable`, the `<kumimoji-table>` element's class, to extend or to define under another name |
| `@johnmorrisdotca/kumimoji/element/define` | Defines `<kumimoji-table>` on the page by being imported; exports nothing |
| `@johnmorrisdotca/kumimoji/react` | `KumimojiBoard` and `KumimojiTable` |

### The calls to learn first

| Call | What it does |
| --- | --- |
| `generateKumimoji(hand, level, seed, options?)` | A game dealt from a seed: the bag, and one grid that finishes it |
| `deal(bag, handSize)` and `placeFromHand`, `moveOnTable`, `liftToHand`, `draw`, `trade` | The opening hand, and each move, every one returning a new game |
| `judgeWithWords(tiles, words)` | What is wrong with a grid, or that it is sound |
| `isFinished(play, verdict)` | Whether the bag is empty, the hand used and every run a word in one piece |
| `checkKumimoji(size, givens, answer, options?)` | The one check a server runs on a finished grid |
| `loadTileWords(language)` | A word list, fetched when first needed |
| `mountKumimoji(element, options?)` and `<kumimoji-table>` | The table, in one call or one tag |
| `kumimojiToJSON`, `kumimojiFromJSON` | A game kept, and read back without trusting it |

### The long tables

The tables of every export for dealing and judging, tiles and grids, playing and keeping a game, a table of players and looking at the table are in [docs/API.md](docs/API.md), and every export of every entry point, with its signature and doc comment, is in the [API reference](https://johnmorrisdotca.github.io/kumimoji/api.html). The types the package exports are listed there too.

The types are `TilePlay`, `Tiles`, `GridVerdict`, `GridRules`, `Run`,
`RunLine`, `Bounds`, `Square`, `CrossingFit`, `KumimojiDeal`,
`KumimojiOptions`, `KumimojiCheck`, `KumimojiLevel`, `KumimojiLength`,
`KumimojiLanguage`, `TileWords`, `TileFaceOf`, `PartyGame`, `PartySettings`,
`PartyPlayer`, `PartySeat`, `PartyEnding`, `JoinRefusal`, `LeaveRefusal`,
`ComputerStep`, `ComputerSaid`, `KumimojiSaved`, `KumimojiExported`, `KumimojiStrings`,
`KumimojiLocale`, `Random`, `Turn`, `Area`, `View`, `MixTile`, `MixShown` and
`LengthRow`.

### The table

`mountKumimoji(element, options?)` from `@johnmorrisdotca/kumimoji/ui` deals and plays a whole game alone in the element and returns a handle (`play()`, `saved()`, `newGame(options?)`, `setGame(saved)`, `setLocale(locale, strings?)`, `destroy()`). Its options are `language`, `hand`, `level`, `gameLength`, `diagonals`, `seed`, `onFinish`, `onChange`, `locale`, `strings`, `theme` and `keep`; each, with its default, is in [docs/API.md](docs/API.md#the-table).

### The element

`<kumimoji-table>` is `mountKumimoji` as a tag: `@johnmorrisdotca/kumimoji/element/define` defines it. Its attributes are `language`, `hand`, `level`, `length`, `diagonals`, `seed` (a number, or `daily`), `lang` and `keep`; it fires `kumimoji-change` and `kumimoji-finish`, which bubble. Every attribute, event and property is in [docs/API.md](docs/API.md#the-element).

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

Every colour is a CSS variable on `.km-root`. Set them in your stylesheet on
`.km-root` with a selector more specific than the table's own, such as
`#table .km-root`, or pass them as `theme`, which sets them
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

```js no-run
import { mountKumimoji } from "@johnmorrisdotca/kumimoji/ui";

mountKumimoji(document.getElementById("table"), {
  theme: { "--km-felt": "#23405a", "--km-tile": "#fffdf7", "--km-wild": "#d4a017", "--km-accent": "#b5452c", "--km-square": "40px" },
});
```

`KumimojiBoard` draws with colours of its own; style it through its `style`
and `className`.

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

## Accessibility

- **A keyboard plays it.** Every square and every tile in the hand is a button
  with a name. Tab lands on one square of the table and on one tile of the
  hand, the arrow keys move between squares (and Left, Right, Home and End
  between the hand's tiles), Enter or Space picks a tile up and lays it, and
  Escape lets go of a tile you have picked up. The keyboard stays where it was
  after each move, including on the buttons under the table, and the table's
  description says so.
- **What is happening is said.** The line above the table, with the tiles left
  and the time, and the line saying which runs are not words, are polite live
  regions, and so is the note after saving or loading.
- **Targets are big enough.** Every button is at least 44 pixels each way,
  which a test holds at a phone's width.
- **Not by colour alone.** A run that is not a word is ringed and listed in
  words; a tile apart from the crossword is faded and said so.
- **Motion.** There is none to reduce: the table has no animation.
- **Not yet.** Letters cannot be typed to lay a tile, and a screen reader hears
  the table as a grid of squares, not as the words they make.

## Browser support

Any current browser: Chrome, Edge, Firefox and Safari, on a desk or a phone.
It needs ES2020 and dynamic `import()`. The table is tested in Chromium and in
WebKit, Safari's engine, at phone size with touch and on a desktop. The rules
run in Node 22 and later, Deno, Bun and web workers, and load by `import` and
by `require()`.

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
- Typing a letter to lay that tile, in the plain-DOM table, which is
  otherwise played from a keyboard.
- A table of players in plain DOM, beside the game alone.
- A computer player at three strengths.
- Word definitions for a finished crossword.
- A Vue wrapper, beside the React one and the tag.

Left out on purpose: play between devices, which needs a server (a table is
kept as text made to be sent, and Itsutsu sends it; the sending is yours); a
command line; CSV; and any name, art or wording of a published game. Kumimoji
runs from a static page and costs nothing to host.

Ideas and pull requests are welcome.

## Architecture

The rules are plain functions over plain data with no DOM: a game is a value,
every move returns the next one, and the same seed deals the same bag in every
browser. Word lists are loaded only when a game opens, and the table is its own
entry (`/ui` for plain DOM, `/element` for a tag, `/react` for React), so a page that wants only the
rules carries none of it. A computer player is pure too, so its turn replays
exactly after a reload.

The file-by-file tree, with a line on each source file, is in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): the rules (`grid`, `judge`, `play`, `generate`, `check`), the table of players (`party*`), the computer player (`computer*`), the Japanese tiles (`kana`), the word lists (`words*`), and the three faces (`ui`, `element`, `react`). Tests sit beside the code they test (`*.test.ts`). `scripts/` builds the demo
and checks the package as npm packs it, `demo/` is the page published on
GitHub Pages, and `table/` taps it in real browsers.

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

<!-- family:start (made by scripts/family-readme.mjs from scripts/family-template.mjs; change those, not this) -->
Kumimoji is one of twenty-four packages, each made for the same site, each at
[github.com/johnmorrisdotca](https://github.com/johnmorrisdotca). The code of every one is MIT.

- [Korokoro](https://github.com/johnmorrisdotca/korokoro) (コロコロ): dice, with notation, exact odds, real sounds and the dice of many games. [Demo](https://johnmorrisdotca.github.io/korokoro/).
- [Kyuubu](https://github.com/johnmorrisdotca/kyuubu) (キューブ): a turning cube for the browser, 2×2 to 7×7, with record solves to replay. [Demo](https://johnmorrisdotca.github.io/kyuubu/).
- [Hitotsu](https://github.com/johnmorrisdotca/hitotsu) (一つ): a colour-card shedding game for two to eight, with the house rules people play. [Demo](https://johnmorrisdotca.github.io/hitotsu/).
- [Toranpu](https://github.com/johnmorrisdotca/toranpu) (トランプ): a deck of playing cards, card games with computer players, and solitaires. [Demo](https://johnmorrisdotca.github.io/toranpu/).
- [Tane](https://github.com/johnmorrisdotca/tane) (種): seeded random numbers and daily seeds, the same in every browser and on every server. [Demo](https://johnmorrisdotca.github.io/tane/).
- [Narabe](https://github.com/johnmorrisdotca/narabe) (並べ): one rules engine for abstract board games, from gomoku and Reversi to Go and checkers. [Demo](https://johnmorrisdotca.github.io/narabe/).
- [Tenka](https://github.com/johnmorrisdotca/tenka) (天下): world conquest for two to six, on a map of the real world. [Demo](https://johnmorrisdotca.github.io/tenka/).
- [Kumimoji](https://github.com/johnmorrisdotca/kumimoji) (組み文字): a crossword tile race, in English and Japanese kana. [Demo](https://johnmorrisdotca.github.io/kumimoji/).
- [Tsunagi](https://github.com/johnmorrisdotca/tsunagi) (繋ぎ): a line-joining logic puzzle whose every level has exactly one answer. [Demo](https://johnmorrisdotca.github.io/tsunagi/).
- [Jarajara](https://github.com/johnmorrisdotca/jarajara) (ジャラジャラ): mahjong tiles drawn as SVG, stacked layouts, and the matching solitaire Awase. [Demo](https://johnmorrisdotca.github.io/jarajara/).
- [Suido](https://github.com/johnmorrisdotca/suido) (水道): a pipe puzzle: turn the pieces until the water reaches every drain. [Demo](https://johnmorrisdotca.github.io/suido/).
- [Domino](https://github.com/johnmorrisdotca/domino) (ドミノ): dominoes and Mexican Train. [Demo](https://johnmorrisdotca.github.io/domino/).
- [Kotoba](https://github.com/johnmorrisdotca/kotoba) (言葉): word lists and word-game rules in English, French, German and Japanese. [Demo](https://johnmorrisdotca.github.io/kotoba/).
- [Sugoroku](https://github.com/johnmorrisdotca/sugoroku) (双六): backgammon and its variants, with the doubling cube and match play. [Demo](https://johnmorrisdotca.github.io/sugoroku/).
- [Kazu](https://github.com/johnmorrisdotca/kazu) (数): grid number puzzles: Sudoku and its variants, Futoshiki and Skyscrapers. [Demo](https://johnmorrisdotca.github.io/kazu/).
- [Meikyuu](https://github.com/johnmorrisdotca/meikyuu) (迷宮): mazes on squares, hexagons, triangles and circles, made from a seed and drawn through with a finger or the mouse. [Demo](https://johnmorrisdotca.github.io/meikyuu/).
- [Hikidashi](https://github.com/johnmorrisdotca/hikidashi) (引き出し): a drawer of small Japanese text tools: era dates, kanji numerals, readings and sentence difficulty. [Demo](https://johnmorrisdotca.github.io/hikidashi/).
- [Chizu](https://github.com/johnmorrisdotca/chizu) (地図): maps of the world and of countries' regions, in English and Japanese, with a quiz and callouts. [Demo](https://johnmorrisdotca.github.io/chizu/).
- [Bushu](https://github.com/johnmorrisdotca/bushu) (部首): find a kanji by the parts it is made of. [Demo](https://johnmorrisdotca.github.io/bushu/).
- [Tobiishi](https://github.com/johnmorrisdotca/tobiishi) (飛び石): peg solitaire with nine boards and seeded solvable challenges. [Demo](https://johnmorrisdotca.github.io/tobiishi/).
- [Jirai](https://github.com/johnmorrisdotca/jirai) (地雷): minesweeper on shaped grids with verified no-guess boards. [Demo](https://johnmorrisdotca.github.io/jirai/).
- [Gunjin](https://github.com/johnmorrisdotca/gunjin) (軍人): five hidden-rank strategy games with pass-the-device play. [Demo](https://johnmorrisdotca.github.io/gunjin/).
- [Karakuri](https://github.com/johnmorrisdotca/karakuri) (からくり): eight hyper-casual puzzle games, some of them physics: draw a shield, pull pins, cut ropes, slide blocks, pour tubes. [Demo](https://johnmorrisdotca.github.io/karakuri/).
- [Houseki](https://github.com/johnmorrisdotca/houseki) (宝石): gem and stone matching puzzles: falling triplets, stone collapse, colour chains and gem swap. [Demo](https://johnmorrisdotca.github.io/houseki/).

**This package is Kumimoji.** The demos of all twenty-four share one header and footer, so each links the rest.
<!-- family:end -->

## Development

```sh
pnpm install --frozen-lockfile
pnpm check             # lint, types and tests, including the checks on the README's tables and examples
pnpm test:table        # the demo in real browsers, by taps
pnpm test:package      # pack it as npm does, install it and import every entry
pnpm test:frameworks   # the six framework examples, built from the packed tarball and played
pnpm test:readme       # every TypeScript and JavaScript example in this README, type-checked and run
pnpm site              # build the demo into ./site
pnpm screenshots:readme  # retake the README's pictures into docs/images (builds the demo first)
```

The pictures are taken on the maintainer's Mac and are retaken only when the look changes; they are in `docs/images` and are not in the package that npm installs.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md). In short: run `pnpm check` before you push (see [Development](#development)).

Please follow the [code of conduct](./CODE_OF_CONDUCT.md). A way to make a check or a deal run for long, or markup that gets out of the drawing, is for the [security policy](./SECURITY.md), not a public issue.

## Changes

See [CHANGELOG.md](./CHANGELOG.md).

The latest release is 1.2.2: the README takes the family's full layout, with pictures of the table and examples that are run.

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
