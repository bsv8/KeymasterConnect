[keymaster-connect](../index.md) / ProtocolResultMessage

# Type Alias: ProtocolResultMessage

> **ProtocolResultMessage** = \{ `v`: *typeof* [`PROTOCOL_VERSION`](../variables/PROTOCOL_VERSION.md); `type`: `"result"`; `id`: `string`; `ok`: `true`; `result`: [`MethodResult`](MethodResult.md); `networkIdentity`: [`NetworkIdentity`](../interfaces/NetworkIdentity.md); `bindingId`: `string`; \} \| \{ `v`: *typeof* [`PROTOCOL_VERSION`](../variables/PROTOCOL_VERSION.md); `type`: `"result"`; `id`: `string`; `ok`: `false`; `error`: [`ProtocolError`](../interfaces/ProtocolError.md); `networkIdentity?`: [`NetworkIdentity`](../interfaces/NetworkIdentity.md); \}
