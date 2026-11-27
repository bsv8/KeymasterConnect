# 接收事件

```ts
const keymaster = new KeymasterConnectClient({
  targetOrigin: keymasterDeploymentOrigin,
  onEvent(event) {
    if (event.event === "channel.message_received") {
      const { channel, publisherPublicKeyHex, messageId, content } = event.data;
    }
  }
});
```

事件不占用请求编号，只接受配置来源、当前窗口、已绑定钱包身份及当前连接绑定的消息。Transport 断开后停止投递；这是实时
事件而不是历史服务，需要长期保存的数据应由 App 自己持久化，并在重连后恢复精确订阅集合。

## 区块高度

`chain.subscribeHeight(handler)` 返回退订函数。浏览器钱包在建连后发送已有链尖，之后高度或哈希变化时推送 `chain.height_changed`。监听器收到 `{ height, blockHash }`，晚注册时会立即收到 SDK 已缓存的链尖。

`chain.getHeight()` 一次性读取钱包已同步的 `{ height, blockHash }`。首次同步前，读取返回 `internal_error`，订阅等待首次推送。查询节点的频率由钱包设置控制。
