---
title: かな・タイルの字形・ワイルド
section: how-to
order: 4
description: かな・タイルの字形・ワイルドの使い方と注意点。
---

## 表示する読みと内部コードは別

かなのタイルには基本の字と、隅に別の形があります。tileKanaは読みを物理的なタイルへ、kanaTileCodeは内部コードへ変換します。tileFaceと語彙の関数で表示や読みを確認します。表示する日本語の文字を、そのまま保存するタイルとして扱いません。

```ts
import {tileKana,kanaTileCode,tileFace} from "@johnmorrisdotca/kumimoji";
console.log(tileKana("が"));
const code = kanaTileCode("は");
console.log(code === null ? null : tileFace(code));
```

## ワイルドに読みを割り当てる

未指定のワイルドは読める文字ではありません。手札や盤面の割り当て関数で対応する読みを選びます。readWildsはすべての並びが単語になる割り当てを探し、ないとnullになります。英語の大文字コードは通常の大文字ではなく、割り当て済みのワイルドです。

## 物理的な種類を保つ

割り当ててもワイルドは同じ種類に属します。保存の読み込みでは元の袋を確認し、新しい普通のタイルにしません。かなも本来の変換を使います。[語彙のAPI](api:TileWords)と[保存形式](grids-and-views.md)を参照してください。
