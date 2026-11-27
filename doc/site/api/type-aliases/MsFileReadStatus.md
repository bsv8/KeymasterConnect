[keymaster-connect](../index.md) / MsFileReadStatus

# Type Alias: MsFileReadStatus

> **MsFileReadStatus** = `MsFileReadStatusDetails` & \{ `phase`: `"pending"` \| `"available"`; `error?`: `never`; \} \| \{ `phase`: `"stopped"`; `error`: [`ProtocolError`](../interfaces/ProtocolError.md); \}

Action for the caller: wait for content, read the complete file, or stop waiting.
