[keymaster-connect](../index.md) / ConnectionRecoveryStorage

# Interface: ConnectionRecoveryStorage

可替换的存储适配器；默认实现访问 sessionStorage，不自动降级到 localStorage。

## Methods

### getItem()

> **getItem**(`key`): `string` \| `null`

#### Parameters

##### key

`string`

#### Returns

`string` \| `null`

***

### setItem()

> **setItem**(`key`, `value`): `void`

#### Parameters

##### key

`string`

##### value

`string`

#### Returns

`void`

***

### removeItem()

> **removeItem**(`key`): `void`

#### Parameters

##### key

`string`

#### Returns

`void`
