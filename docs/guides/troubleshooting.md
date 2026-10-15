---
title: Troubleshooting and FAQ
section: troubleshooting
order: 9
description: Find out why words are not loaded, a grid or table move is refused, or progress will not restore.
---

## Words have not loaded

Await loadTileWords; in Node import words first or call loadTileWordsFromModule. Cache state is per language. tileWords throws rather than judge with missing words. Browser loading can fail; ready rejects and native error callbacks/events report the failure.

## A grid is refused

Check accepted words, connectivity, diagonal rules, assigned wilds and physical bag inventory. Internal kana codes differ from glyphs. boundsOf null means no tiles; decodeGrid null means invalid encoding; readWilds null means no valid assignment; crossingFit null means the proposed crossing does not fit. bestLaying null means no word can be laid; tradeChoice null means only wilds remain.

## A party action is refused

doneRefused, joinRefused and leaveRefused return reasons or null when allowed. Read the native last-round/resigned/out state instead of treating every seat as active. A party bag must fit all starting hands plus a draw round. decodeParty without familyKey checks shape only; supply that function to verify physical tile ownership.

## Saved progress will not restore

Use the original seed and complete settings. A JSON import regenerates the bag and refuses impossible progress with null. Native handles expose null progress until ready. Await newGame/setGame and retain errors. [Saving/embedding](save-and-embed.md) and [the full contract](../embeds.md) cover lifecycle and messages.
