# アプリ道具のウォレット AI 登録

SDK **0.1.4** より提供します。wire は v1 のままです。利用前に当該版本が npm に公開発行済みであることを確認してください。SDK 発行は端到端モデル検証の完了を意味しません。

## 登録と呼出

アプリは正常接続を先に完了し、`registerTools()` で当該接続の道具集合を置換します。登録に追加承認は不要ですが、ウォレットユーザーは道具を個別無効化できます。空配列は全部注銷します。

```ts
import { KeymasterConnectClient, type AiTool } from "keymaster-connect";

const client = new KeymasterConnectClient({ targetOrigin: "https://keymaster.cc" });
await client.login({ text: "アプリに接続" });

const tools: AiTool[] = [{
  name: "summarize_selection",
  description: "当該アプリ内ユーザー選択内容の摘要を返却します。データを変更しません。",
  parameters: {
    type: "object",
    properties: { label: { type: "string", maxLength: 100 } },
    required: ["label"],
    additionalProperties: false,
  },
  async execute(params, { signal }) {
    signal.throwIfAborted();
    return { label: params.label, summary: "アプリ提供の摘要" };
  },
}];

const registered = await client.registerTools(tools);
// registered.names はウォレット派生の全体道具名。ローカルは summarize_selection 識別のままです。

// 道具変更：完全な新集合を再提出します。増分追加ではありません。
// 注銷：
await client.registerTools([]);
```

ウォレット AI が道具を呼出すと、SDK はアプリ回呼を実行します。引数と結果は JSON のみであり、関数・undefined・BigInt・循環物・バイナリ緩衝は拒否します。SDK は供給者秘密鍵・完全対話・ウォレット秘密鍵をアプリに渡しません。

回呼異常は通用失敗のみ返し、秘密漏洩しうる堆積や異常文本を返しません。AI への業務失敗は明確な JSON 業務結果で表現してください。

## 身份・接続・キャンセル

- 道具はアプリ身份で名前空間を区分します。同一アプリの他有効接続が既に道具を保持する場合、新接続の登録は失敗します。実行先接続を黙って切替えません。
- 道具は元接続有効時のみ呼出可能です。一時停止・切断・施錠・logout・紐付け置換後は道具と待機が失効します。接続回復後は明示的に再登録してください。SDK は業務回呼を自動回復・再演しません。
- `close()` はウォレットへの道具注銷を努力通知しますが、ウォレットウィンドウを終了せず、永続 Connect 認可も取消しません。情報喪失時は送達を保証できず、ウォレット自身のウィンドウと周期検査が権限を回収します。
- 登録は支払・署名その他 Connect 業務許可ではありません。アプリ回呼が別途 Connect 業務を発起する場合は対応する外部認可に従います。
- ウォレット取消やタイムアウトは `AbortSignal` で通知します。アプリは信号を伝播し、取消可能作業を停止してください。既発生の副作用は取消不能であり、結果未知を自動再試行してはなりません。
- 回呼実行中に空でない道具集合を置換できません。空配列は注銷して待機を取消できます。単回呼出の既定タイムアウトは二分です。
- 登録タイムアウトやキャンセルは結果未知の意味であり、クライアントは実行可能回呼を掃除します。ウォレット取消済みと仮定せず、明示的に再登録してください。

## 引数 Schema 範囲

これは明確な JSON Schema 部分集合であり、未対応关键字は直接拒否します。完全 JSON Schema 実装を詐称しません。

- `type`：object・array・string・number・integer・boolean・null。
- `description`・`enum`。
- オブジェクト：`properties`・`required`・ブール値 `additionalProperties`。
- 配列：`items`・`minItems`・`maxItems`。
- 文字列：`minLength`・`maxLength`（Unicode 符号点数）。
- 数値：`minimum`・`maximum`。integer は JavaScript 安全整数に限定。

根引数はオブジェクト、配列は items 宣言必須です。`$ref`・組合分岐・pattern・format・合併型は未対応です。道具名は字母始まり 1–40 位 ASCII 字母／数字／下線、接続毎最大 64 個。JSON 最深 32 層・Schema 最深 16 層・単道具情報最大約 1 MB（JSON 文字数）です。

## ウォレットホスト

`keymaster-connect/server` は `KeymasterAiToolReceiver` を提供します。ホスト `isCurrent(bindingId)` は実際情報源・正確 origin・同一本番受信端の有効紐付け・ウォレット周期を同時核対しなければなりません。自称文字列の単純比較で認可してはなりません。

ホストはアプリ身份・道具名空間・接続競合を担当し、道具受信端は登録枠・逆呼出・結果対応・タイムアウト・キャンセルを担当します。アプリ源符号を受取らず、ウォレット資金や永続認可を接管しません。

単文書 AI 結果 iframe は独立 MessageChannel 狭橋を使用し、このアプリ道具通路を使用せず、この SDK でウォレット権限を取得できません。
