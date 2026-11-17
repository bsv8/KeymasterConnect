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

## 接続ライフサイクル

切断またはページ更新後、ウォレットを開くアプリは再ログインし、ウォレットから起動したアプリはウォレットから開き直します。SDK は認可の復元情報を保存せず、自動再接続や業務リクエストの再送を行いません。タブは直接閉じることができ、終了通知や応答待ちは不要です。長期的なアプリ操作許可はウォレットが別に管理します。署名済み・送信済みの処理はタブを閉じても取り消されません。

```ts
await keymaster.logout();
```
