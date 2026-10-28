---
pageClass: capability-map-page
---

# 能力索引

所有方法都由 [`KeymasterConnectClient`](/api/classes/KeymasterConnectClient) 提供。
首次连接无需预知公钥和网络；`login / resume / launch` 返回 `networkIdentity`。
所有业务使用当前连接绑定，不携带钱包公钥或网络选择字段，也不能越过业务确认或验签。

| 方法 | 中文用途 |
| --- | --- |
| `connect.login` | 用户确认钱包身份后建立连接 |
| `connect.resume` | 恢复当前钱包连接，返回实际身份；缺缓存时重建缺省上下文 |
| `connect.logout` | 撤销当前来源的本地连接、订阅和运行授权 |
| `connect.launch` | 使用 appView 一次性令牌建立会话 |
| `identity.get` | 返回有有效期、接收方和签名的身份断言 |
| `intent.sign` | 在明确用户意图下签署 App 提供的字节 |
| `cipher.encrypt` / `cipher.decrypt` | 在钱包网络、Owner 和精确 origin 下加解密二进制内容 |
| `p2pkh.transfer` | 当前 Connect v1 范围拒绝；付款使用 `payment.pay` |
| `payment.pay` / `payment.status` | 在连接钱包网络付款／查询付款状态 |
| `payment.channel.register` | 注册 App 支付用途，取得付款必填的 channelId；不授予免确认额度 |
| `channel.publish` | 向精确频道发布已签名 JSON |
| `channel.subscription_set` | 替换当前会话贡献的精确订阅集合 |
| `storage.list` | 列出 App 隔离命名空间中的目录和对象 |
| `storage.directory.create/delete` | 创建或删除目录标记 |
| `storage.put/get/delete` | 写入、读取或删除对象 |
| `msfile.stat` | 查询内容所在 Supplier 和报价 |
| `msfile.seed.read` / `msfile.block.read` | 读取并校验 Seed 或 Block |

## 公共调用选项

付款前调用 `registerPaymentChannel({ channelName: "checkout", paymentType: "p2pkh" })`，
把返回的 `channelId` 传给每次 `paymentPay`。相同 App、名称、用途及网络重复注册得到同一编号。
付款授权和签名策略由钱包负责，SDK 不提供设备连接或软硬钱包切换。
缺 channelId 会明确拒绝，不由 Keymaster 补默认值。恢复连接不删除历史付款责任。

```ts
const result = await keymaster.identityGet(params, {
  requestId: crypto.randomUUID(), // 本次请求编号
  timeoutMs: 30_000,              // 本地等待上限，毫秒
  signal: abortController.signal  // 取消信号
});
```

精确 Params（参数）、Result（结果）、常量和每个字段的中文解释以
[API 页面](/api/)为准。也可以使用底层 `request(method, params)`；方法字面量会推导正确类型。

## Channel 事件

`channel.message_received` 推送已经验签的频道、发行人公钥、消息编号和 JSON 内容。
成功发布只表示 Keymaster 接受本地操作，不表示远端已经收到。

## 身份要求

Storage 和 MSFile 需要已验证 App 身份及相应 requirement（所需能力声明）。本地缓存重置后，可在
`resume({ appIdentity })` 中重新验证已有 proof，见[会话](/concepts/sessions)。App 不能指定
Supplier、桶、物理路径、凭据、私钥或付款额度。
