[keymaster-connect](../index.md) / AiToolReceiverOptions

# Interface: AiToolReceiverOptions

## Methods

### isCurrent()

> **isCurrent**(`bindingId`): `boolean`

Must verify the same Receiver's current binding, exact peer, origin and wallet lifecycle.

#### Parameters

##### bindingId

`string`

#### Returns

`boolean`

***

### send()

> **send**(`message`): `void`

#### Parameters

##### message

[`AiToolMessage`](../type-aliases/AiToolMessage.md)

#### Returns

`void`

***

### names()

> **names**(`definitions`): `string`[]

Host derives globally unique names and rejects conflicting live connection ownership.

#### Parameters

##### definitions

readonly [`AiToolDefinition`](AiToolDefinition.md)[]

#### Returns

`string`[]

***

### changed()

> **changed**(): `void`

#### Returns

`void`

***

### randomUUID()?

> `optional` **randomUUID**(): `string`

#### Returns

`string`
