---
title: 保存と卓の埋め込み
section: how-to
order: 6
description: 保存と卓の埋め込みの使い方と注意点。
---

## 同じ袋に対して復元する

```ts
import {loadTileWordsFromModule} from "@johnmorrisdotca/kumimoji/words";
import {generateKumimoji,deal,kumimojiToJSON,kumimojiFromJSON} from "@johnmorrisdotca/kumimoji";
await loadTileWordsFromModule("english");
const dealt = generateKumimoji(3,"hard",44);
const saved = {deal:dealt,play:deal(dealt.givens,dealt.size),elapsedMs:0};
console.log((await kumimojiFromJSON(kumimojiToJSON(saved)))?.deal.seed);
```

kumimojiFromJSONは語彙を読み、設定とシードから配り直し、持っているタイルが元の袋にあるか確認します。不正な形式や版、別のゲーム、不整合ではnullに解決します。小さい進行用の形式と複数人用の保存もあります。

## 非同期の卓を配置する

```ts no-run
import {mountKumimoji} from "@johnmorrisdotca/kumimoji/ui";
const host = document.createElement("div");
document.body.append(host);
const table = mountKumimoji(host,{hand:3,level:"hard",seed:44,keep:false});
await table.ready;
console.log(table.play()?.hand.length);
table.destroy();
```

readyを待ち、変更の読み込みにはnewGameやsetGameのPromiseを使います。Reactは配置と解放を管理します。要素は登録用エントリーかdefineTableを使います。ローカルの取得値には構造化した進行と保存値があります。

## 公開仕様を保つ

[埋め込み仕様](../../embeds.md)に属性、準備、変更、終了、エラー、ホストの保存値、操作表示があります。フレームは保存領域を読まず、keep:falseは手動の保存と読み込みの操作を隠します。keepは自動保存を有効にしません。コールバックはホスト用で、イベントはJSON安全なコピーです。送信元を確認し、私的な進行は信頼するホスト設定に保ちます。
