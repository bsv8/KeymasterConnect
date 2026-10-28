[keymaster-connect](../index.md) / KeymasterConnectReceiver

# Class: KeymasterConnectReceiver

生产钱包与闭环测试共用同一接收端，不内置测试业务或默认自动授权。

## Constructors

### Constructor

> **new KeymasterConnectReceiver**(`options`): `KeymasterConnectReceiver`

#### Parameters

##### options

[`ConnectReceiverOptions`](../interfaces/ConnectReceiverOptions.md)

#### Returns

`KeymasterConnectReceiver`

## Methods

### isAllowedPeer()

> **isAllowedPeer**(`event`, `claim?`): `event is ReceiverMessage & { source: ConnectPeer }`

每次从宿主读取来源策略；只接受 HTTP(S) 实际来源，拒绝 opaque origin。

#### Parameters

##### event

[`ReceiverMessage`](../interfaces/ReceiverMessage.md)

##### claim?

`boolean` = `false`

#### Returns

`event is ReceiverMessage & { source: ConnectPeer }`

***

### acceptReady()

> **acceptReady**(`event`): `boolean`

appView 首条合法 ready 才认领来源；无效版本和外来窗口不改变绑定。

#### Parameters

##### event

[`ReceiverMessage`](../interfaces/ReceiverMessage.md)

#### Returns

`boolean`

***

### accept()

> **accept**(`event`): `Promise`\<[`ReceiverRequest`](../interfaces/ReceiverRequest.md)\<`"identity.get"` \| `"intent.sign"` \| `"cipher.encrypt"` \| `"cipher.decrypt"` \| `"p2pkh.transfer"` \| `"payment.pay"` \| `"payment.status"` \| `"payment.channel.register"` \| `"connect.login"` \| `"connect.resume"` \| `"connect.logout"` \| `"connect.launch"` \| `"channel.publish"` \| `"channel.subscription_set"` \| `"storage.list"` \| `"storage.directory.create"` \| `"storage.directory.delete"` \| `"storage.put"` \| `"storage.get"` \| `"storage.delete"` \| `"msfile.stat"` \| `"msfile.seed.read"` \| `"msfile.block.read"`\> \| `null`\>

校验并签发请求上下文。重复在途 ID 被忽略；非法可信请求返回标准错误。

#### Parameters

##### event

[`ReceiverMessage`](../interfaces/ReceiverMessage.md)

#### Returns

`Promise`\<[`ReceiverRequest`](../interfaces/ReceiverRequest.md)\<`"identity.get"` \| `"intent.sign"` \| `"cipher.encrypt"` \| `"cipher.decrypt"` \| `"p2pkh.transfer"` \| `"payment.pay"` \| `"payment.status"` \| `"payment.channel.register"` \| `"connect.login"` \| `"connect.resume"` \| `"connect.logout"` \| `"connect.launch"` \| `"channel.publish"` \| `"channel.subscription_set"` \| `"storage.list"` \| `"storage.directory.create"` \| `"storage.directory.delete"` \| `"storage.put"` \| `"storage.get"` \| `"storage.delete"` \| `"msfile.stat"` \| `"msfile.seed.read"` \| `"msfile.block.read"`\> \| `null`\>

***

### acceptCancel()

> **acceptCancel**(`event`): [`ReceiverRequest`](../interfaces/ReceiverRequest.md)\<`"identity.get"` \| `"intent.sign"` \| `"cipher.encrypt"` \| `"cipher.decrypt"` \| `"p2pkh.transfer"` \| `"payment.pay"` \| `"payment.status"` \| `"payment.channel.register"` \| `"connect.login"` \| `"connect.resume"` \| `"connect.logout"` \| `"connect.launch"` \| `"channel.publish"` \| `"channel.subscription_set"` \| `"storage.list"` \| `"storage.directory.create"` \| `"storage.directory.delete"` \| `"storage.put"` \| `"storage.get"` \| `"storage.delete"` \| `"msfile.stat"` \| `"msfile.seed.read"` \| `"msfile.block.read"`\> \| `null`

取消只通知宿主；宿主决定是否仍可取消，执行中的不可逆操作不能被协议回滚。

#### Parameters

##### event

[`ReceiverMessage`](../interfaces/ReceiverMessage.md)

#### Returns

[`ReceiverRequest`](../interfaces/ReceiverRequest.md)\<`"identity.get"` \| `"intent.sign"` \| `"cipher.encrypt"` \| `"cipher.decrypt"` \| `"p2pkh.transfer"` \| `"payment.pay"` \| `"payment.status"` \| `"payment.channel.register"` \| `"connect.login"` \| `"connect.resume"` \| `"connect.logout"` \| `"connect.launch"` \| `"channel.publish"` \| `"channel.subscription_set"` \| `"storage.list"` \| `"storage.directory.create"` \| `"storage.directory.delete"` \| `"storage.put"` \| `"storage.get"` \| `"storage.delete"` \| `"msfile.stat"` \| `"msfile.seed.read"` \| `"msfile.block.read"`\> \| `null`

***

### assertCurrent()

> **assertCurrent**(`context`): `void`

宿主在排队结束及不可逆业务前复核；这里只判断协议权威，不代替资金审批。

#### Parameters

##### context

[`ReceiverRequest`](../interfaces/ReceiverRequest.md)

#### Returns

`void`

***

### replyResult()

> **replyResult**\<`M`\>(`context`, `result`): `void`

回复成功时才签发新的连接绑定；业务返回值必须已由宿主转换成公开 DTO。

#### Type Parameters

##### M

`M` *extends* `"identity.get"` \| `"intent.sign"` \| `"cipher.encrypt"` \| `"cipher.decrypt"` \| `"p2pkh.transfer"` \| `"payment.pay"` \| `"payment.status"` \| `"payment.channel.register"` \| `"connect.login"` \| `"connect.resume"` \| `"connect.logout"` \| `"connect.launch"` \| `"channel.publish"` \| `"channel.subscription_set"` \| `"storage.list"` \| `"storage.directory.create"` \| `"storage.directory.delete"` \| `"storage.put"` \| `"storage.get"` \| `"storage.delete"` \| `"msfile.stat"` \| `"msfile.seed.read"` \| `"msfile.block.read"`

#### Parameters

##### context

[`ReceiverRequest`](../interfaces/ReceiverRequest.md)\<`M`\>

##### result

[`MethodResult`](../type-aliases/MethodResult.md)\<`M`\>

#### Returns

`void`

***

### replyError()

> **replyError**(`context`, `error`): `void`

失败仍属于原请求；不额外生成取消响应，不误撤销同窗口后来建立的新绑定。

#### Parameters

##### context

[`ReceiverRequest`](../interfaces/ReceiverRequest.md)

##### error

[`ProtocolError`](../interfaces/ProtocolError.md)

#### Returns

`void`

***

### sendEvent()

> **sendEvent**(`target`, `origin`, `event`): `void`

事件只给当前有效绑定添加接收端上下文；业务发布者不能自报绑定/钱包身份。

#### Parameters

##### target

[`ConnectPeer`](../interfaces/ConnectPeer.md)

##### origin

`string`

##### event

[`ProtocolEventPayload`](../type-aliases/ProtocolEventPayload.md)

#### Returns

`void`

***

### sendReady()

> **sendReady**(`target`): `void`

ready/closing 只承载生命周期，不携带授权或业务结果。

#### Parameters

##### target

[`ConnectPeer`](../interfaces/ConnectPeer.md)

#### Returns

`void`

***

### sendClosing()

> **sendClosing**(`target`): `void`

同一运行期至多通知一次 closing，发送失败不重试。

#### Parameters

##### target

[`ConnectPeer`](../interfaces/ConnectPeer.md)

#### Returns

`void`

***

### reset()

> **reset**(): `void`

开始新的 Session Window 运行期，才重置 closing 一次性通知。

#### Returns

`void`

***

### clear()

> **clear**(): `void`

clear 仅清协议运行态；授权撤销和业务责任收尾必须由宿主另外执行。

#### Returns

`void`
