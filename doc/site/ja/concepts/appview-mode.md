# appView モード

Keymaster がアプリを自ら起動する場合、アプリはワンタイムトークンを消費し、ホストウォレット `window.opener` と通信します。中間 Session Window は不要です。
初期化にウォレット身份は渡しません。`launch` 成功は現在ウォレット公開鍵とネットワークを返し、アプリが自判断・案内します。アプリ発行者公開鍵はウォレット公開鍵ではありません。

```ts
const keymaster = new KeymasterConnectClient({
  targetOrigin: sessionWindowOrigin, // 起動 URL が注入したホストウォレット正確 origin
  mode: "appView"
});

await keymaster.connect();
const session = await keymaster.launch({ launchToken, appIdentity });
```

SDK は既存 opener を再利用し、傾聴準備後に ready を送信します。opener 喪失時は安全失敗し、
`window.open()` に切替わることはありません。`connect.launch` は popup モードで使用できず、無効トークンがログインに降格することもありません。
