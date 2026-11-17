# 接続ライフサイクル

```ts
const session = await keymaster.login({ text: "Sign in" });
console.log(session.networkIdentity);
// Explicitly revoke this connection when requested by the user:
await keymaster.logout();
```

切断またはページ更新後、ウォレットを開くアプリは再ログインし、ウォレットから起動したアプリはウォレットから開き直します。SDK は認可の復元情報を保存せず、自動再接続や業務リクエストの再送を行いません。タブは直接閉じることができ、終了通知や応答待ちは不要です。長期的なアプリ操作許可はウォレットが別に管理します。署名済み・送信済みの処理はタブを閉じても取り消されません。

`login` / `launch` → `networkIdentity: { bsvNetwork, publicKeyHex }`.
`connect()` / `ready` ≠ authorization.

Transport bindings are tied to the actual window, exact origin, wallet generation and worker generation. New connections receive new bindings and must check the returned identity.
