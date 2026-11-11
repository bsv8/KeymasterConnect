[keymaster-connect](../index.md) / KeymasterAiToolReceiver

# Class: KeymasterAiToolReceiver

Protocol-only reverse-call endpoint; owns no App authorization, funds or persistence.

## Constructors

### Constructor

> **new KeymasterAiToolReceiver**(`options`): `KeymasterAiToolReceiver`

#### Parameters

##### options

[`AiToolReceiverOptions`](../interfaces/AiToolReceiverOptions.md)

#### Returns

`KeymasterAiToolReceiver`

## Methods

### sync()

> **sync**(): `void`

Host calls on connection changes; revoke stale in-flight calls without replay.

#### Returns

`void`

***

### list()

> **list**(): readonly [`AiToolDefinition`](../interfaces/AiToolDefinition.md)[]

#### Returns

readonly [`AiToolDefinition`](../interfaces/AiToolDefinition.md)[]

***

### available()

> **available**(`name`): `boolean`

#### Parameters

##### name

`string`

#### Returns

`boolean`

***

### handle()

> **handle**(`value`): `boolean`

#### Parameters

##### value

`unknown`

#### Returns

`boolean`

***

### invoke()

> **invoke**(`name`, `args`, `signal`, `timeoutMs?`): `Promise`\<[`JSONValue`](../type-aliases/JSONValue.md)\>

#### Parameters

##### name

`string`

##### args

`Record`\<`string`, [`JSONValue`](../type-aliases/JSONValue.md)\>

##### signal

`AbortSignal`

##### timeoutMs?

`number` = `120_000`

#### Returns

`Promise`\<[`JSONValue`](../type-aliases/JSONValue.md)\>

***

### dispose()

> **dispose**(): `void`

#### Returns

`void`
