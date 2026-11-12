---
pageClass: capability-map-page
---

# 機能一覧

すべてのメソッドは [`KeymasterConnectClient`](/api/classes/KeymasterConnectClient) が提供します。
初回接続時に公開鍵やネットワークを事前に知る必要はありません。`login / resume / launch` は `networkIdentity` を返します。
すべての業務は現在の接続紐付けを使用し、ウォレット公開鍵やネットワーク選択欄を持たず、業務確認や検証を回避できません。

| メソッド | 用途 |
| --- | --- |
| `connect.login` | ユーザーがウォレット身份を確認後に接続を確立する |
| `connect.resume` | 現在ウォレット接続を再開し、実際の身份を返す。キャッシュ空時は既定コンテキストを再構築する |
| `connect.logout` | 現在 origin のローカル接続・購読・実行認可を取消する |
| `connect.launch` | appView ワンタイムトークンでセッションを確立する |
| `identity.get` | 有効期限・宛先・署名付き身份表明を返す |
| `intent.sign` | 明示的なユーザー意思のもとでアプリ提供バイト列に署名する |
| `cipher.encrypt` / `cipher.decrypt` | ウォレットネットワーク・Owner・正確 origin に紐付けてバイナリを暗号化／復号する |
| `payment.pay` / `payment.status` | 接続中ウォレットのネットワークに outputs 配列で支払う／支払状態を照会する |
| `channel.publish` | 正確チャネルに署名付き JSON を公開する |
| `channel.subscription_set` | 現在セッションの正確チャネル購読集合を置換する |
| `storage.list` | アプリ隔離名前空間のディレクトリとオブジェクトを列挙する |
| `storage.directory.create/delete` | ディレクトリマーカーを作成／削除する |
| `storage.put/get/delete` | オブジェクトを書込／読取／削除する |
| `storage.encrypted.put/get` | ウォレットが暗号化して保存／復号して返却する（`0.1.5` 候補、`0.1.4` Receiver は拒否） |
| `msfile.stat` | コンテンツの所在と提供者見積を照会する |
| `msfile.seed.read` / `msfile.block.read` | Seed または Block を読取り検証する |

## 共通呼出オプション

支払は outputs 配列（金額＋ locking script hex）を直接提出し、順序がチェーン上の順序となります。お釣りはウォレットが追加し、ネットワークは現在接続、料金はウォレット設定に従います。旧 `payment.channel.register` と `p2pkh.transfer` は削除され、呼出不可です。支払出力の表示説明は独立サブエントリ `keymaster-connect/script`（`interpretLockingScript`）が P2PKH／P2PK／標準マルチシグ／OP_RETURN／未知として解釈します。表示専用であり、支払可否を決定しません。
支払認可と署名方針はウォレットが担い、SDK は機器接続やソフト・ハード切替を提供しません。

```ts
const result = await keymaster.identityGet(params, {
  requestId: crypto.randomUUID(), // 今回リクエスト番号
  timeoutMs: 30_000,              // ローカル待機上限（ミリ秒）
  signal: abortController.signal  // キャンセル信号
});
```

正確な Params（引数）・Result（結果）・定数・各欄の中国語説明は
[API ページ](/api/) を参照してください。低水準 `request(method, params)` も利用可能で、メソッド名から正しい型が推論されます。

## Channel イベント

`channel.message_received` は検証済みチャネル・発行者公開鍵・メッセージ番号・JSON 内容を通知します。
公開成功は Keymaster がローカル操作を受理した意味であり、遠端が受信した意味ではありません。

## 身份要件

Storage と MSFile は検証済みアプリ身份と対応 requirement（機能宣言）が必要です。ローカルキャッシュ初期化後は
`resume({ appIdentity })` で既存 proof を再検証してください（[セッション](/ja/concepts/sessions) 参照）。アプリは
Supplier・バケット・物理パス・認証情報・秘密鍵・支払金額を指定できません。
