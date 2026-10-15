---
title: Load and judge with word lists
section: how-to
order: 2
description: Load word lists in the browser or on the server, judge a layout with them, and keep their notices.
---

## Separate browser and server loading

The core does not bundle both dictionaries. In browsers loadTileWords dynamically imports the selected dictionary; in Node import the words entry before loading. tileWords is synchronous and throws if the selected list has not loaded. A check without words must not claim a word is valid.

```ts
import {loadTileWordsFromModule} from "@johnmorrisdotca/kumimoji/words";
import {judgeWithWords,tileWordsReady} from "@johnmorrisdotca/kumimoji";
const words = await loadTileWordsFromModule("english");
const tiles = new Map([["0,0","c"],["0,1","a"],["0,2","t"]]);
console.log(tileWordsReady("english"),judgeWithWords(tiles,words).sound);
```

## Use the language mappings

TileWords has allowed words, encoded words by length, physical mix, glyph/reading conversions and wildcard/family functions. Prefer judgeWithWords rather than judging internal kana codes as visible text. tileWordsReady reports whether the selected language is cached. readTileWordsWith is a loader hook; configure it before the first load because already loaded lists remain cached.

## Preserve the data notices

The English and Japanese data have their own notices, distinct from MIT code. [NOTICE.md](../../NOTICE.md) and [the existing licence table](../../README.md#the-word-lists-and-their-licences) preserve the terms and attribution. Generated dictionaries are changed through their source workflow, not edited by hand.
