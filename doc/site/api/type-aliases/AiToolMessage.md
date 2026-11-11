[keymaster-connect](../index.md) / AiToolMessage

# Type Alias: AiToolMessage

> **AiToolMessage** = \{ `v`: `1`; `type`: `"tools.register"`; `bindingId`: `string`; `id`: `string`; `tools`: [`AiToolDefinition`](../interfaces/AiToolDefinition.md)[]; \} \| \{ `v`: `1`; `type`: `"tools.registered"`; `bindingId`: `string`; `id`: `string`; `ok`: `true`; `names`: `string`[]; \} \| \{ `v`: `1`; `type`: `"tools.registered"`; `bindingId`: `string`; `id`: `string`; `ok`: `false`; `error`: `string`; \} \| \{ `v`: `1`; `type`: `"tools.invoke"`; `bindingId`: `string`; `id`: `string`; `name`: `string`; `arguments`: `Record`\<`string`, [`JSONValue`](JSONValue.md)\>; \} \| \{ `v`: `1`; `type`: `"tools.result"`; `bindingId`: `string`; `id`: `string`; `ok`: `true`; `result`: [`JSONValue`](JSONValue.md); \} \| \{ `v`: `1`; `type`: `"tools.result"`; `bindingId`: `string`; `id`: `string`; `ok`: `false`; `error`: `string`; \} \| \{ `v`: `1`; `type`: `"tools.cancel"`; `bindingId`: `string`; `id`: `string`; \}

Connect v1 公开契约。独立于钱包内部执行 DTO、能力框架和持久化。
