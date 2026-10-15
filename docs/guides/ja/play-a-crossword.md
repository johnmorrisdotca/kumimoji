---
title: ひとりの進行を作って判定する
section: how-to
order: 3
description: ひとりの進行を新しい値で持ち、タイルを置いて動かし、引く前と終了前に確認します。
---

## 進み具合を新しい値で持つ

TilePlayには袋、返したタイル、取り出した位置、手札、盤面があります。配置、移動、戻す、交換、引く操作の戻り値を保存します。タイルのMapだけを変えて操作を再現しません。

```ts
import {loadTileWordsFromModule} from "@johnmorrisdotca/kumimoji/words";
import {deal,placeFromHand,judgeWithWords,encodeGrid} from "@johnmorrisdotca/kumimoji";
const words = await loadTileWordsFromModule("english");
let play = deal("catdog",3);
for (let col=0;col<3;col++) play = placeFromHand(play,0,`0,${col}`);
console.log(encodeGrid(play.tiles),judgeWithWords(play.tiles,words).sound);
```

## 引く前と終了前に確認する

mayDrawとisFinishedにはGridVerdictを渡します。並びがすべて単語で、盤面がつながっている必要があります。斜めを読む設定もあります。変更後にjudgeWithWordsを使います。手札、判定、袋の残りでできる操作が変わります。ワイルドには読みを割り当てます。

## 座標と保存形式を分ける

squareAtは負の値も含む行と列を名前にします。encodeGridは使った範囲を切り出し、移動した位置を残しません。不正な文字列ではdecodeGridがnullになります。[表示](grids-and-views.md)に回転と拡大があります。
