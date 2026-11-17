# 连接生命周期

```ts
const session = await keymaster.login({ text: "Sign in" });
console.log(session.networkIdentity);
// Explicitly revoke this connection when requested by the user:
await keymaster.logout();
```

连接中断或页面刷新后，App 主动连接须重新登录；钱包启动的 App 须从钱包重新打开。SDK 不保存授权恢复记录、不自动重连、不重放旧业务请求。用户直接关闭页签，无需发送关闭通知或等待回复。长期应用操作许可由钱包独立保存，关闭页签不撤回已签名或广播的操作。

`login` / `launch` → `networkIdentity: { bsvNetwork, publicKeyHex }`.
`connect()` / `ready` ≠ authorization.

Transport bindings are tied to the actual window, exact origin, wallet generation and worker generation. New connections receive new bindings and must check the returned identity.
