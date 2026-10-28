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
