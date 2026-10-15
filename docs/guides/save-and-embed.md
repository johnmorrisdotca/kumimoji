---
title: Save progress and embed a table
section: how-to
order: 6
description: Save and restore progress against the same bag, and mount an asynchronous table.
---

## Restore against the same bag

```ts
import {loadTileWordsFromModule} from "@johnmorrisdotca/kumimoji/words";
import {generateKumimoji,deal,kumimojiToJSON,kumimojiFromJSON} from "@johnmorrisdotca/kumimoji";
await loadTileWordsFromModule("english");
const dealt = generateKumimoji(3,"hard",44);
const saved = {deal:dealt,play:deal(dealt.givens,dealt.size),elapsedMs:0};
console.log((await kumimojiFromJSON(kumimojiToJSON(saved)))?.deal.seed);
```

kumimojiFromJSON loads the language list, regenerates the deal from its setup/seed and verifies that held tiles belong to the original bag. It resolves to null for malformed, unsupported, foreign or inconsistent data. encodeTileProgress/decodeTileProgress store smaller solo progress; decodeParty optionally checks the shared bag with a family function.

## Mount an asynchronous table

```ts no-run
import {mountKumimoji} from "@johnmorrisdotca/kumimoji/ui";
const host = document.createElement("div");
document.body.append(host);
const table = mountKumimoji(host,{hand:3,level:"hard",seed:44,keep:false});
await table.ready;
console.log(table.play()?.hand.length);
table.destroy();
```

Wait for ready and use newGame/setGame promises when loading changes. The React wrapper manages mounting and cleanup. Elements register through element/define or defineTable; native handles/getters retain structured play and saved progress.

## Keep the public contract

The [embed guide](../embeds.md) specifies attributes, ready/change/finish/error messages, host saved state and controls. Frames read no storage. keep:false hides manual file saving/loading controls; keep never enables automatic persistence. onChange/onFinish/onError are host callbacks; public event details are JSON-safe snapshots. Validate message origin/source and keep private saved progress in trusted host options.
