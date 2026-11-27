# イベント受信

```ts
const keymaster = new KeymasterConnectClient({
  targetOrigin: keymasterDeploymentOrigin,
  onEvent(event) {
    if (event.event === "channel.message_received") {
      const { channel, publisherPublicKeyHex, messageId, content } = event.data;
    }
  }
});
```

イベントはリクエスト番号を使用しません。設定出所・現在ウィンドウ・紐付け済みウォレット身份・現在接続紐付けのメッセージのみ受理します。転送切断後は投遞停止します。これは履歴ではなく
実況であり、保存すべきデータはアプリ自身が永続化し、再接続後に正確購読集合を回復してください。

## ブロック高

`chain.subscribeHeight(handler)` は購読解除関数を返します。ブラウザーウォレットは接続時に取得済みのチェーン先端を送り、ブロック高またはハッシュが変わると通知します。ハンドラーには `{ height, blockHash }` が渡されます。取得済みの値があれば、登録時にすぐ通知されます。イベント名は `chain.height_changed` です。

`chain.getHeight()` はウォレットが最後に同期した `{ height, blockHash }` を取得します。初回同期の前は `internal_error` が返り、購読は最初の通知を待ちます。ノードへの問い合わせ間隔はウォレットで設定します。
