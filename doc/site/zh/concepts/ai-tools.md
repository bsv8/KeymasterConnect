# 向钱包 AI 注册 App 工具

SDK **0.1.4** 提供此能力；wire 仍为 v1。消费方升级前应确认 npm 注册表中该版本已发布。SDK 发布不表示真实模型端到端验收已经完成。

## 注册与调用

App 先完成正常连接，再用 `registerTools()` 替换本连接的工具集合。注册无需额外审批；钱包中的用户可以单独关闭工具。空数组注销全部工具。

```ts
import { KeymasterConnectClient, type AiTool } from "keymaster-connect";

const client = new KeymasterConnectClient({ targetOrigin: "https://keymaster.cc" });
await client.login({ text: "连接应用" });

const tools: AiTool[] = [{
  name: "summarize_selection",
  description: "返回本应用中用户选择内容的摘要，不修改数据。",
  parameters: {
    type: "object",
    properties: { label: { type: "string", maxLength: 100 } },
    required: ["label"],
    additionalProperties: false,
  },
  async execute(params, { signal }) {
    signal.throwIfAborted();
    return { label: params.label, summary: "应用提供的摘要" };
  },
}];

const registered = await client.registerTools(tools);
// registered.names 是钱包派生的全局工具名；本地仍以 summarize_selection 标识。

// 修改工具：再次传入完整集合；不是增量追加。
// 注销：
await client.registerTools([]);
```

钱包 AI 发起调用时，SDK 执行 App 回调。参数与结果均为 JSON；不能返回函数、undefined、BigInt、循环对象或二进制缓冲区。SDK 不会把供应商密钥、完整聊天或钱包私钥交给 App。

回调异常只返回通用失败，避免堆栈或异常文本泄露秘密。需要向 AI 表达业务失败时，返回明确的 JSON 业务结果。

## 身份、连接与取消

- 工具以应用身份划分命名空间。同一应用已有另一有效连接持有工具时，新连接注册会失败；不会暗中任选连接执行。
- 工具仅在原连接有效时可调用。暂停、断线、锁定、logout 或运行绑定更换后，工具和在途等待失效。显式恢复连接后要重新注册，SDK 不自动复活业务回调或重放调用。
- `close()` 尽力通知钱包注销工具，但不关闭钱包窗口、不撤销持久 Connect 授权。消息丢失时不能保证立即送达；钱包自身的窗口和生命周期检查仍会撤权。
- 注册不是付款、签名或其它 Connect 业务许可。App 回调另行发起 Connect 业务时，仍遵守对应外部授权。
- 钱包取消或超时会通知 `AbortSignal`；App 应传播信号并停止可取消工作。已发生的副作用不能回滚；结果未知不能自动重试。
- 正在执行回调时不能替换非空工具集合；传空数组可以注销并取消等待。单个调用默认超时两分钟。
- 注册超时或取消意味着结果未知，客户端清除可执行回调；请重新明确注册，不假设钱包已回滚。

## 参数 Schema 支持范围

这是明确的 JSON Schema 子集，不支持的关键字直接拒绝，不能假装完整实现 JSON Schema：

- `type`：object、array、string、number、integer、boolean、null。
- `description`、`enum`。
- 对象：`properties`、`required`、布尔 `additionalProperties`。
- 数组：`items`、`minItems`、`maxItems`。
- 字符串：`minLength`、`maxLength`（Unicode 码点数）。
- 数字：`minimum`、`maximum`；integer 限定 JavaScript 安全整数。

根参数必须是 object，array 必须声明 items。暂不支持 `$ref`、组合分支、pattern、format 或 union type。工具名为字母开头的 1–40 位 ASCII 字母/数字/下划线；每连接至多 64 个工具。JSON 最深 32 层、Schema 最深 16 层、单条工具消息最多约 1 MB（以 JSON 字符数计）。

## 钱包宿主

`keymaster-connect/server` 提供 `KeymasterAiToolReceiver`。宿主的 `isCurrent(bindingId)` 必须同时核对真实消息源、精确 origin、同一生产 Receiver 的有效绑定以及钱包生命周期。不能仅靠比较自报字符串授权。

宿主负责应用身份、工具名空间和连接冲突；工具 Receiver 负责注册帧、反向调用、结果关联、超时及取消。不接收 App 源代码，不接管钱包资金或持久授权。

AI 单文件结果 iframe 使用独立的 MessageChannel 窄桥，不使用这个 App 工具通道，也不能调用本 SDK 来取得钱包权限。
