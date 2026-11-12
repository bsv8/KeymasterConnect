# 错误与取消

```ts
import { KeymasterProtocolError, KeymasterTransportError } from "keymaster-connect";

try {
  await keymaster.resume();
} catch (error) {
  if (error instanceof KeymasterProtocolError) console.log(error.code);
  if (error instanceof KeymasterTransportError) console.log(error.code);
}
```

- `KeymasterProtocolError`：Keymaster 已收到请求，但按业务或策略拒绝。应判断 `code`，不要解析英文信息。已删除的钱包选择字段收到 `invalid_request`；App 从连接结果读取网络后自行判断，不通过请求切换网络。
- `connection_expired`：钱包／Worker 世代变化或连接绑定失效；SDK 清空本地身份，App 必须显式重新连接并判断返回身份，不会自动改绑。
- `KeymasterTransportError`：弹窗拦截、窗口关闭、超时、opener 丢失、客户端关闭或 `unsupported_protocol`（协议版本不兼容）；不表示会话已注销。

请求可传 `AbortSignal`。取消会立即拒绝本地 Promise，并尽力发送 cancel；已经执行的外部操作
不保证可以补偿，结果未知时应查询业务状态，不能盲目重试。
