---
title: Kana, tile faces and wilds
section: how-to
order: 4
description: Tell displayed kana from internal tile codes, and assign readings to wild tiles.
---

## Visible readings differ from internal codes

Japanese has base kana tiles whose printed corner lists other forms. tileKana maps a reading to its physical base tile; kanaTileCode gives its internal code. tileFace and TileWords glyphOf/soundOf describe what is shown and read. Do not slice displayed Japanese strings as if their characters were saved tile identities.

```ts
import {tileKana,kanaTileCode,tileFace} from "@johnmorrisdotca/kumimoji";
console.log(tileKana("が"));
const code = kanaTileCode("は");
console.log(code === null ? null : tileFace(code));
```

## Assign a wild safely

An unassigned wild is not a readable letter. assignHandTile and assignTableTile select a supported face; readWilds seeks an assignment making all runs words and returns null if none fits. judgeWithWords incorporates the language rules. Uppercase English codes represent assigned wilds rather than ordinary uppercase letters.

## Preserve physical identity

inventoryKey/familyKey keep assigned wilds in the wildcard family. Progress imports check the exact physical bag, so assigning a wildcard does not mint a new ordinary tile. Japanese representations and variant readings are retained by their native mappings. See [tile reference](api:TileWords) and [grid encoding](grids-and-views.md).
