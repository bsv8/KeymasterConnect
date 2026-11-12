# ウォレット受信端の接続

`keymaster-connect/server` はウォレットが本番利用する受信端であり、試験用模擬サーバーではありません。Client と受信端は公開契約を共有し、`keymaster.cc` 内部に依存しません。

## 責任分担

受信端はメッセージ検証・ウィンドウと origin の出所・接続紐付け・処理中リクエスト対応・結果／イベント封包・キャンセル・ready／closing 制御フレームを担います。

ウォレットは信頼できる出所方針・ウォレット身份・ライフサイクル世代を提供し、アンロック／認可／UI・署名・資金・保存・永続支払冪等を引き続き担当します。プロトコル検証の通過を「ユーザー業務承認済み」と解釈してはなりません。proof の暗号学的有効性は、アプリがカタログ信頼済みである意味でも支払認可を持つ意味でもありません。

## 接続構成

以下は構成の模式であり、`wallet` は SDK 既定実装ではなく、ホストが実装します。

```ts
import { KeymasterConnectReceiver } from "keymaster-connect/server";

const receiver = new KeymasterConnectReceiver({
  peer: () => ({ mode: "popup", source: window.opener }),
  lifecycle: () => wallet.lifecycleSnapshot(),
  identity: () => wallet.currentNetworkIdentity(),
});

window.addEventListener("message", async event => {
  if (receiver.acceptReady(event)) return;

  const cancelled = receiver.acceptCancel(event);
  if (cancelled) {
    if (await wallet.cancelIfSafe(cancelled)) {
      receiver.replyError(cancelled, {
        code: "user_rejected", message: "User rejected",
      });
    }
    return;
  }

  const request = await receiver.accept(event);
  if (!request) return;
  try {
    receiver.assertCurrent(request);
    const result = await wallet.authorizeAndExecute(request);
    receiver.replyResult(request, result);
  } catch (error) {
    receiver.replyError(request, wallet.toPublicError(error));
  }
});
```

実際のウォレットはリクエストコンテキストを非同期に保持し、ユーザー確認後に実行できます。元コンテキストの代わりに同形オブジェクトを捏造してはなりません。受信端はオブジェクト身份でリクエスト権威を判定します。内部 owner／session 欄を公開接続結果として返してはなりません。

`replyResult` の接続成功結果は身份一致かつ世代有効時のみ紐付けを発行します。内部業務 DTO はホスト側で公開 DTO に適合させてから受信端に渡してください。SDK はウォレット内部型やサービスを取込みません。

## ライフサイクルと安全

- popup はホスト指定 opener オブジェクトのみ受理します。appView の正確アプリ origin は信頼できる起動コンテキスト由来でなければなりません。既知子ウィンドウがある場合は source も同時指定します。
- `lifecycle()` はホスト真値 `walletGeneration` と `runGeneration` の二つを返します。リクエスト引数や永続化された旧 SDK 紐付けから復元してはなりません。
- 受信端は受信時・実行権威再確認時・応答時・イベント送信時に世代を検査します。`clear()` は処理中の身份読取と旧リクエストを無効化しますが、永続業務責任を取消しません。
- 新規 Session Window 実行期は `reset()` を呼び、準備完了は `sendReady()`、終了通知は `sendClosing()` です。同一実行期の closing 通知は最大一回であり、clear はこの冪等ゲートを初期化しません。
- ホストは承認後・実際署名／書込／送信前に業務権威を再確認しなければなりません。受信端の同期的検査は非同期跨ぎ業務の最終 I/O 防壁を代替できません。
- キャンセルは努力通知です。`AbortSignal` は遠端未署名を証明しません。署名や送信が結果未知で発生済みなら、元業務 ID と責任を保持し、SDK pending 表の掃除で資金を解放してはなりません。
- リクエスト ID は転送対応専用です。支払 `clientRequestId`・不変申請・冪等台帳はウォレットが永続管理し、一時リクエスト ID で代替できません。
- 同一 source の処理中重複 ID は二重実行せず、元リクエストを打切る別錯誤応答も返しません。終端状態後に取引き材料をプロトコル層に緩存しません。

## 試験境界

同一の本番 Client と受信端はメモリ環境および実際の跨 origin ブラウザで閉環できます。模擬対象はウォレット業務のみです。固定报文と悪性报文は Client 符号化と独立に生成し、両端の同誤通過を防ぎます。

プロトコル閉環はウォレット認可・承認・実際署名・UTXO・永続支払冪等・送信・実機正当性を証明しません。ウォレットは実際業務適合と統合経路を別途検証しなければなりません。
