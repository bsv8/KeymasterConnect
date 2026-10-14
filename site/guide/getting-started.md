# 快速开始

```bash
pnpm add @keymaster/connect
```

```ts
import { KeymasterConnectClient } from "@keymaster/connect";

const networkIdentity = {
  bsvNetwork: "main" as const, // 使用目标钱包的实际网络；test 钱包填 test
  publicKeyHex: selectedPublicKeyHex // 钱包公钥，不是 App 发行人公钥
};
const keymaster = new KeymasterConnectClient({
  networkIdentity,
  targetOrigin: getRequiredConfig("KEYMASTER_ORIGIN") // 受信任钱包来源
});

const session = await keymaster.login({ text: "登录示例应用" });
localStorage.setItem("keymaster.networkIdentity", JSON.stringify(session.networkIdentity));
```

首次登录应由用户点击触发。用户确认使用的身份必须与客户端配置的网络、公钥一致。
同一个公钥可以出现在 main 和 test，不能只保存公钥，也不能在恢复时默认使用 main。

业务参数中的 `walletPublicKeyHex` 填登录结果的钱包公钥。SDK 自动把客户端的完整
`networkIdentity` 放入每条协议消息，并核对回复、事件中的网络与公钥。

```ts
const now = Math.floor(Date.now() / 1000);
const result = await keymaster.identityGet({
  text: "验证当前钱包身份", // 用户可读的确认内容
  aud: location.origin,       // 断言接收方，必须是当前来源
  iat: now,                  // 签发时间，Unix 秒
  exp: now + 300,            // 过期时间，Unix 秒
  claims: ["key.label"],     // 请求的身份字段
  walletPublicKeyHex: session.walletPublicKeyHex
});
```

页面重新打开时，从保存的完整身份创建客户端，再恢复连接：

```ts
import { validateNetworkIdentity } from "@keymaster/connect";

const saved = localStorage.getItem("keymaster.networkIdentity");
if (!saved) throw new Error("请先连接钱包");
const savedIdentity = validateNetworkIdentity(JSON.parse(saved));
const restored = new KeymasterConnectClient({
  networkIdentity: savedIdentity,
  targetOrigin: getRequiredConfig("KEYMASTER_ORIGIN")
});
await restored.resume(savedIdentity.publicKeyHex);

// 用户主动注销当前来源的连接时调用：
await restored.logout(savedIdentity.publicKeyHex);
```

身份信息是公开定位信息，保存它不授予权限。Storage 或 MSFile App 在本地记录被重置后，
还需在 `resume` 中重新提交已有签名 `appIdentity`，见[会话](/concepts/sessions)。
完整方法见[能力索引](/guide/capabilities)，精确字段见[API](/api/)。
