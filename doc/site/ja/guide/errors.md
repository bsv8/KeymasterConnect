# 錯誤とキャンセル

```ts
import { KeymasterProtocolError, KeymasterTransportError } from "keymaster-connect";

try {
  await keymaster.resume();
} catch (error) {
  if (error instanceof KeymasterProtocolError) console.log(error.code);
  if (error instanceof KeymasterTransportError) console.log(error.code);
}
```

- `KeymasterProtocolError`：Keymaster はリクエストを受信したが、業務または方針で拒否しました。`code` で分岐し、英文情報を解析しないでください。削除済みウォレット選択欄は `invalid_request` を受けます。アプリは接続結果からネットワークを読取って自判断し、リクエスト毎の切替は行いません。
- `connection_expired`：ウォレット／Worker 世代変化または接続紐付け失効です。SDK はローカル身份を掃除し、アプリは明示的に再接続して返却身份を判断しなければなりません。黙って再紐付けしません。
- `KeymasterTransportError`：ポップアップ阻止・ウィンドウ終了・タイムアウト・opener 喪失・クライアント終了・`unsupported_protocol`（プロトコル版本不一致）です。セッション取消の意味ではありません。

リクエストは `AbortSignal` を受付けます。キャンセルはローカル Promise を即時拒否し、キャンセルを努力送信します。既実行の外部効果は
取消を保証できず、結果未知時は業務状態を照会して確定し、盲目再試行してはなりません。
