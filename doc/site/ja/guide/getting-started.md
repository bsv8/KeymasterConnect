# はじめに

Keymaster は、初期化時にネットワークが固定される単一鍵ウォレットです。初回接続時に公開鍵やネットワークを事前に知る必要はありません。

```ts
import { KeymasterConnectClient } from "keymaster-connect";

const keymaster = new KeymasterConnectClient({
  targetOrigin: keymasterDeploymentOrigin // 信頼できる正確な Keymaster origin を設定
});
const session = await keymaster.login({ text: "アプリにログイン" });
const { publicKeyHex, bsvNetwork } = session.networkIdentity;
// 返却された身份からアプリ側で判断・表示すること。鍵やネットワークの切替 API は提供しない。
```

ログイン成功後、SDK の読取専用 `networkIdentity` が紐付け身份を返します。接続確立前および終了後は `null` です。
業務リクエストにウォレット公開鍵やネットワークを含めません。SDK が現在の接続紐付けを使用します。

```ts
await keymaster.identityGet({
  aud: window.location.origin,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 300,
  text: "本人確認",
  claims: []
});
```

## 再開と終了

```ts
await keymaster.resume(); // ウォレット指定不要。現在のウォレット公開鍵・ネットワーク・claims を返す
await keymaster.logout(); // 現在 origin の接続を取消する
keymaster.close();        // 転送のみ終了する。ログアウトではない
```

Storage / MSFile の利用時は `login` または `resume({ appIdentity })` で発行者署名 proof を提出します。
ウォレットがロック中でもアンロックや確認を求められる場合があります。アプリは内部の接続紐付けを保存しません。新規ウィンドウでは再開または再ログインし、返却身份を再確認してください。

これはハード切替です。初期化 `networkIdentity`、業務 `walletPublicKeyHex`、ネットワーク選択 `assetId`、resume/logout の公開鍵引数は削除され、旧プロトコルとの互換性はありません。詳細は[リリースノート](/ja/release-notes)。
