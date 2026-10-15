---
title: Use one bag at a shared table
section: how-to
order: 5
description: Let two to eight players draw from one bag, apply solo moves to a seat, and handle computer turns.
---

## Share the bag, keep separate boards

startParty creates two to eight player rows. partyFits and partyTilesNeeded check enough tiles for hands and a round of draws. partyLength promotes a chosen length to a bag large enough for the table. Use public labels for examples; local names are display data.

```ts
import {startParty,seatPlay,partyTilesLeft} from "@johnmorrisdotca/kumimoji";
const settings = {size:3,level:"hard",seed:44,gameLength:"short",language:"english",doubleSet:false,diagonals:false,hints:false} as const;
const game = startParty(settings,"catdogsun",["Seat 1","Seat 2"]);
console.log(game.players.length,seatPlay(game).hand,partyTilesLeft(game));
```

## Apply solo actions to a seat

seatPlay reads the current player's TilePlay. Apply native solo actions and withSeatPlay puts it back into the party. endTurn needs a judged grid and hand-spelling predicate; doneRefused explains trade/last-standing refusals. Passes, resignations, last turns and winners use the party's native functions.

## Add computer turns deliberately

planComputerTurn supplies ordered native steps and afterComputerTurn gives the settled result. These can do substantial word search; keep examples and host work bounded. joinRefused/leaveRefused return a reason or null when allowed. Saved parties can verify tile families with decodeParty and holdsItsBag. See [reference](api:PartyGame).
