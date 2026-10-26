[keymaster-connect](../index.md) / ConnectReceiverOptions

# Interface: ConnectReceiverOptions

## Methods

### peer()

> **peer**(): [`ReceiverPeerPolicy`](../type-aliases/ReceiverPeerPolicy.md)

#### Returns

[`ReceiverPeerPolicy`](../type-aliases/ReceiverPeerPolicy.md)

***

### lifecycle()

> **lifecycle**(): [`ReceiverLifecycle`](ReceiverLifecycle.md)

#### Returns

[`ReceiverLifecycle`](ReceiverLifecycle.md)

***

### identity()

> **identity**(): `Promise`\<[`NetworkIdentity`](NetworkIdentity.md)\>

首次建立连接时读取真实钱包身份；不得从请求参数取值。

#### Returns

`Promise`\<[`NetworkIdentity`](NetworkIdentity.md)\>

***

### send()?

> `optional` **send**(`target`, `origin`, `message`): `void`

#### Parameters

##### target

[`ConnectPeer`](ConnectPeer.md)

##### origin

`string`

##### message

[`ProtocolResultMessage`](../type-aliases/ProtocolResultMessage.md)

#### Returns

`void`

***

### control()?

> `optional` **control**(`target`, `message`): `void`

#### Parameters

##### target

[`ConnectPeer`](ConnectPeer.md)

##### message

[`ProtocolReadyMessage`](ProtocolReadyMessage.md) \| [`ProtocolClosingMessage`](ProtocolClosingMessage.md)

#### Returns

`void`

***

### randomUUID()?

> `optional` **randomUUID**(): `string`

#### Returns

`string`
