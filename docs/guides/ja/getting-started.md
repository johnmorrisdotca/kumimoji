---
title: はじめに
section: tutorial
order: 1
description: Kumimojiを入れ、配る前に語彙を読み、シードで手札を配ります。
---

シードから配った英字やかなのタイルで単語を組み合わせます。基本ルールにDOMや時計は不要で、卓用の機能が表示や経過時間を扱います。

## インストール

```sh
npm install @johnmorrisdotca/kumimoji
```

Node 22以降や新しいブラウザーを使います。組み込むときは[NOTICE.md](../../../NOTICE.md)と語彙の出典を保ちます。

## 配る前に語彙を読む

```ts
import {loadTileWordsFromModule} from "@johnmorrisdotca/kumimoji/words";
import {generateKumimoji,deal} from "@johnmorrisdotca/kumimoji";
await loadTileWordsFromModule("english");
const dealt = generateKumimoji(3,"hard",44);
const play = deal(dealt.givens,dealt.size);
console.log(dealt.seed,play.hand,play.tiles.size);
```

words用エントリーはNode向けの読み込み処理を登録します。ブラウザーでは必要な言語の一覧を別に読みます。生成や判定の前に完了を待ちます。手札は3、7、11枚で、難しさがワイルド、長さが袋の大きさを決めます。生成された解答は完成できる証明で、別の正しい組み方でも遊べます。

## 次の使い方

[語彙](load-word-lists.md)、[ひとりで遊ぶ](play-a-crossword.md)、[かなとワイルド](kana-and-wilds.md)、[複数人](shared-tables.md)、[保存と埋め込み](save-and-embed.md)、[API](entry:main)へ進みます。
