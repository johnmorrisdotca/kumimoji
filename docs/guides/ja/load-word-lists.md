---
title: 語彙の読み込みと判定
section: how-to
order: 2
description: ブラウザーとサーバーで語彙を読み込み、配置を判定し、出典の通知を保ちます。
---

## ブラウザーとサーバーを分ける

基本機能には両方の辞書を含めません。ブラウザーでは必要な一覧を動的に読み、Nodeではwords用エントリーを先に読みます。tileWordsは同期処理で、未読の言語ではエラーになります。語彙なしで正しい単語と判定しません。

```ts
import {loadTileWordsFromModule} from "@johnmorrisdotca/kumimoji/words";
import {judgeWithWords,tileWordsReady} from "@johnmorrisdotca/kumimoji";
const words = await loadTileWordsFromModule("english");
const tiles = new Map([["0,0","c"],["0,1","a"],["0,2","t"]]);
console.log(tileWordsReady("english"),judgeWithWords(tiles,words).sound);
```

## 言語の変換を使う

TileWordsは単語、長さ別のコード、物理的な枚数、表示と読み、ワイルドや同じ種類の関数を持ちます。かなの内部コードを文字として判定せず、judgeWithWordsを使います。tileWordsReadyで読み込み済みか確認できます。独自ローダーは最初の読み込み前に設定します。読んだ一覧はキャッシュされます。

## 出典の表示を保つ

英語と日本語のデータにはMITのコードとは別の通知があります。[NOTICE.md](../../../NOTICE.md)と[既存の表](../../../README.md#the-word-lists-and-their-licences)を保ちます。生成された辞書は手で編集しません。
