---
title: 1つの袋で複数人が遊ぶ
section: how-to
order: 5
description: 1つの袋で複数人が遊ぶの使い方と注意点。
---

## 袋を共有し盤面を分ける

startPartyで2〜8人を作ります。partyFitsとpartyTilesNeededで手札と1回の抽選分を確認します。partyLengthは必要なら長さを上げます。例では公開用の席名を使います。

```ts
import {startParty,seatPlay,partyTilesLeft} from "@johnmorrisdotca/kumimoji";
const settings = {size:3,level:"hard",seed:44,gameLength:"short",language:"english",doubleSet:false,diagonals:false,hints:false} as const;
const game = startParty(settings,"catdogsun",["Seat 1","Seat 2"]);
console.log(game.players.length,seatPlay(game).hand,partyTilesLeft(game));
```

## ひとり用の操作を席へ適用する

seatPlayで今の人のTilePlayを読み、操作後にwithSeatPlayで卓へ戻します。endTurnには盤面の判定と手札で単語を作れるかの関数が必要です。拒否の理由、パス、辞退、最後の手番、勝者も本来の関数を使います。

## コンピューターの手番を扱う

planComputerTurnは順序のある操作、afterComputerTurnはその後の結果です。単語の検索に時間がかかる場合があります。参加や退席の拒否関数は理由か、許可されるときnullを返します。保存した卓もタイルの種類を確認できます。[卓のAPI](api:PartyGame)を参照してください。
