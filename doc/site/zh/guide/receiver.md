# 钱包接收端接入

`keymaster-connect/server` 提供钱包生产实际使用的 Receiver，不是测试模拟 server。Client 和 Receiver 共用公开契约，不依赖 `keymaster.cc` 内部 contracts。

## 谁负责什么

Receiver 负责消息校验、窗口与 origin 来源、连接绑定、在途请求关联、结果/事件封包、取消及 ready/closing 控制帧。

钱包提供可信来源策略、钱包身份及生命周期世代，并负责解锁/授权/UI、签名、资金、存储和持久幂等。不能把“协议上通过校验”解释成“用户已经批准业务”。proof 密码学有效也不代表 App 已被 catalog 信任或拥有付款权限。

## 接入结构

下面是结构示意，`wallet` 不是 SDK 提供的默认实现，必须由宿主实现：

```ts
import { KeymasterConnectReceiver } from "keymaster-connect/server";

const receiver = new KeymasterConnectReceiver({
  peer: () => ({ mode: "popup", source: window.opener }),
  lifecycle: () => wallet.lifecycleSnapshot(),
  identity: () => wallet.currentNetworkIdentity(),
});

window.addEventListener("message", async event => {
  if (receiver.acceptReady(event)) return;

  const cancelled = receiver.acceptCancel(event);
  if (cancelled) {
    if (await wallet.cancelIfSafe(cancelled)) {
      receiver.replyError(cancelled, {
        code: "user_rejected", message: "User rejected",
      });
    }
    return;
  }

  const request = await receiver.accept(event);
  if (!request) return;
  try {
    receiver.assertCurrent(request);
    const result = await wallet.authorizeAndExecute(request);
    receiver.replyResult(request, result);
  } catch (error) {
    receiver.replyError(request, wallet.toPublicError(error));
  }
});
```

实际钱包的 UI 调度可以异步保存请求上下文，等待用户确认后执行；不要构造同形对象代替原上下文。Receiver 使用对象身份检查请求权威。钱包不得把内部 owner/session 字段作为公开连接结果返回。

`replyResult` 的成功连接结果只在身份匹配、世代仍有效时签发绑定。内部业务 DTO 应在宿主适配成公开 DTO，再交给 Receiver；SDK 不导入钱包内部类型或服务。

## 生命周期与安全

- popup 只接受宿主指定 opener 对象；appView 的精确 App origin 必须来自可信启动上下文。有已知 child 窗口时同时指定 source。
- `lifecycle()` 返回 `walletGeneration` 和 `runGeneration` 两个宿主真值。不能从请求参数或持久化的旧 SDK binding 恢复它们。
- Receiver 在接收、执行权威复核、回复及事件发送时检查世代；`clear()` 使进行中的身份读取和旧请求失效，不撤销持久业务责任。
- 新 Session Window 运行期调用 `reset()`，ready 用 `sendReady()`，关闭通知用 `sendClosing()`。同一运行期 closing 至多通知一次，clear 不重置这个幂等门禁。
- 宿主在审批后、实际签名/写入/广播之前仍需复核业务权威。Receiver 的同步检查无法代替跨异步业务的最终 I/O 围栏。
- 取消是尽力通知。`AbortSignal` 不证明远端没有签名；已经产生签名或广播未知时，必须保留原业务 ID 和责任，不能以清理 SDK pending 表为由释放资金。
- 请求 ID 只用于传输关联。Payment 的 `clientRequestId`、不可变申请及幂等账本由钱包持久维护，不能用临时请求 ID 替代。
- 同一 source 的在途重复 ID 不重复执行，也不另发错误响应截断原请求；终态后不在协议栈缓存交易材料。

## 测试边界

同一个生产 Client 与 Receiver 可在内存环境及真实跨 origin 浏览器中闭环；只模拟钱包业务。固定报文和恶意报文测试独立于 Client 编码生成预期，避免两边同错仍通过。

协议闭环不证明钱包授权、审批、真实签名、UTXO、持久幂等、广播或实体硬件正确。钱包必须另外验证真实业务适配和集成路径。
