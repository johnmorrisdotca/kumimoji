---
title: Build and judge solo progress
section: how-to
order: 3
description: Learn build and judge solo progress.
---

## Keep immutable progress

TilePlay stores the original bag, returned tiles, draw position, hand and grid. placeFromHand, moveOnTable, liftToHand, swapWithHand, draw and trade return progress values. Keep the return value; do not mutate the tiles map to imitate those operations.

```ts
import {loadTileWordsFromModule} from "@johnmorrisdotca/kumimoji/words";
import {deal,placeFromHand,judgeWithWords,encodeGrid} from "@johnmorrisdotca/kumimoji";
const words = await loadTileWordsFromModule("english");
let play = deal("catdog",3);
for (let col=0;col<3;col++) play = placeFromHand(play,0,`0,${col}`);
console.log(encodeGrid(play.tiles),judgeWithWords(play.tiles,words).sound);
```

## Ask before drawing or finishing

mayDraw and isFinished take a native GridVerdict. Every run must be an accepted word and the grid connected; rules can also read diagonals. Use judgeWithWords after changes. A full hand, an invalid grid or an empty bag can change which action is offered. Wild tiles need assigned readings before their runs can be judged.

## Keep coordinates and encoding separate

squareAt names integer row/column coordinates, including negatives. encodeGrid trims the occupied bounds and writes a canonical relative shape; it does not preserve how far the table was panned. decodeGrid returns null for an invalid encoded grid. [Views](grids-and-views.md) covers rotation and zoom without changing rules.
