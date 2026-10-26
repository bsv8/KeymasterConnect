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
const price = await keymaster.priceGet({});
await keymaster.identityGet({
  aud: window.location.origin,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 300,
  text: "确认身份",
  claims: []
});
```

## 恢复和关闭

```ts
await keymaster.resume(); // 不指定钱包，返回当前钱包公钥、网络和 claims
await keymaster.logout(); // 撤销当前来源连接
keymaster.close();        // 仅关闭传输，不代替注销
```

Storage / MSFile 接入可在 `login` 或 `resume({ appIdentity })` 提交发行人签名 proof。
钱包锁定时仍可能要求解锁或确认。App 不保存内部连接绑定；新窗口建立后显式恢复，并重新判断返回身份。

这是硬切换：删除初始化 `networkIdentity`、业务 `walletPublicKeyHex`、用于选择网络的 `assetId`，以及 resume/logout 的公钥参数。旧协议不兼容。详情见[发布说明](/release-notes)。
