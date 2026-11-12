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
