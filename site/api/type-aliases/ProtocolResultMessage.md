[@keymaster/connect](../index.md) / ProtocolResultMessage

# Type Alias: ProtocolResultMessage

> **ProtocolResultMessage** = \{ `v`: *typeof* [`PROTOCOL_VERSION`](../variables/PROTOCOL_VERSION.md); `type`: `"result"`; `networkIdentity`: [`NetworkIdentity`](../interfaces/NetworkIdentity.md); `id`: `string`; `ok`: `true`; `result`: `MethodResult`; \} \| \{ `v`: *typeof* [`PROTOCOL_VERSION`](../variables/PROTOCOL_VERSION.md); `type`: `"result"`; `networkIdentity`: [`NetworkIdentity`](../interfaces/NetworkIdentity.md); `id`: `string`; `ok`: `false`; `error`: [`ProtocolError`](../interfaces/ProtocolError.md); \}

顶层 result 报文。
