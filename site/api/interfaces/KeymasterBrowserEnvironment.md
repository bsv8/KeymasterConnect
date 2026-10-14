[@keymaster/connect](../index.md) / KeymasterBrowserEnvironment

# Interface: KeymasterBrowserEnvironment

Injectable browser primitives used by tests and embedded runtimes.

## Methods

### open()

> **open**(`url`, `target`, `features`): `Window` \| `null`

#### Parameters

##### url

`string`

##### target

`string`

##### features

`string`

#### Returns

`Window` \| `null`

***

### opener()

> **opener**(): `Window` \| `null`

#### Returns

`Window` \| `null`

***

### addMessageListener()

> **addMessageListener**(`listener`): `void`

#### Parameters

##### listener

(`event`) => `void`

#### Returns

`void`

***

### removeMessageListener()

> **removeMessageListener**(`listener`): `void`

#### Parameters

##### listener

(`event`) => `void`

#### Returns

`void`

***

### setTimeout()

> **setTimeout**(`handler`, `timeoutMs`): `number`

#### Parameters

##### handler

() => `void`

##### timeoutMs

`number`

#### Returns

`number`

***

### clearTimeout()

> **clearTimeout**(`timer`): `void`

#### Parameters

##### timer

`number`

#### Returns

`void`

***

### setInterval()

> **setInterval**(`handler`, `intervalMs`): `number`

#### Parameters

##### handler

() => `void`

##### intervalMs

`number`

#### Returns

`number`

***

### clearInterval()

> **clearInterval**(`timer`): `void`

#### Parameters

##### timer

`number`

#### Returns

`void`

***

### randomUUID()

> **randomUUID**(): `string`

#### Returns

`string`
