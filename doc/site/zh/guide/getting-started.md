# 开始接入

Keymaster 是单私钥、初始化时固定网络的钱包。首次接入不需要预先知道公钥或网络。

```ts
import { KeymasterConnectClient } from "keymaster-connect";

const keymaster = new KeymasterConnectClient({
  targetOrigin: keymasterDeploymentOrigin // 配置可信、精确的 Keymaster origin
});
const session = await keymaster.login({ text: "登录应用" });
const { publicKeyHex, bsvNetwork } = session.networkIdentity;
// App 根据返回身份自行判断、提示；SDK 不提供切换私钥或网络的 API。
```

登录成功后，SDK 的只读 `networkIdentity` 返回绑定身份；连接建立前及关闭后为 `null`。
业务请求不携带钱包公钥或网络，SDK 使用当前连接绑定。

```ts
await keymaster.identityGet({
  aud: window.location.origin,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 300,
  text: "确认身份",
  claims: []
});
```

## 连接生命周期

连接中断或页面刷新后，App 主动连接须重新登录；钱包启动的 App 须从钱包重新打开。SDK 不保存授权恢复记录、不自动重连、不重放旧业务请求。用户直接关闭页签，无需发送关闭通知或等待回复。长期应用操作许可由钱包独立保存，关闭页签不撤回已签名或广播的操作。

```ts
await keymaster.logout();
```
