---
title: Getting started
section: tutorial
order: 1
description: Install Kumimoji, read a word list before dealing, and deal a seeded hand.
---

Build a crossword from a seeded English or Japanese tile bag. The pure rules need no DOM or clock; the optional table entry handles presentation and elapsed time.

## Install

```sh
npm install @johnmorrisdotca/kumimoji
```

Use Node 22 or later or a modern browser. Keep the shipped [NOTICE.md](../../NOTICE.md) and word-list attribution with your integration.

## Load words before dealing

```ts
import {loadTileWordsFromModule} from "@johnmorrisdotca/kumimoji/words";
import {generateKumimoji,deal} from "@johnmorrisdotca/kumimoji";
await loadTileWordsFromModule("english");
const dealt = generateKumimoji(3,"hard",44);
const play = deal(dealt.givens,dealt.size);
console.log(dealt.seed,play.hand,play.tiles.size);
```

The words entry registers a module loader for Node. Browser components load the selected list separately when needed. Await loading before synchronous generation or judging. A hand is 3, 7 or 11; difficulty controls wilds, and length controls the bag. A generated solution proves the bag can be finished; players may build another accepted crossword.

## Pick a recipe

[Word loading](load-word-lists.md), [solo progress](play-a-crossword.md), [Japanese/wilds](kana-and-wilds.md), [shared tables](shared-tables.md), [save/embed](save-and-embed.md) and the [reference](entry:main) cover the next steps.
