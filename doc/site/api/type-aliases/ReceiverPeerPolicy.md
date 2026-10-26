[keymaster-connect](../index.md) / ReceiverPeerPolicy

# Type Alias: ReceiverPeerPolicy

> **ReceiverPeerPolicy** = \{ `mode`: `"popup"`; `source`: [`ConnectPeer`](../interfaces/ConnectPeer.md) \| `null`; \} \| \{ `mode`: `"appView"`; `origin`: `string`; `source?`: [`ConnectPeer`](../interfaces/ConnectPeer.md) \| `null`; \}

来源由宿主装配；appView 的 origin 来自已验证的启动上下文。
