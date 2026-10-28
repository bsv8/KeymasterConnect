[keymaster-connect](../index.md) / ProtocolEventName

# Type Alias: ProtocolEventName

> **ProtocolEventName** = `"channel.message_received"`

协议对外 event 名常量集合（server-pushed 事件）。

设计缘由：
  - `channel.message_received` 是已验签的 Channel 公开消息，只发送给
    当前 session 已精确订阅的频道；
