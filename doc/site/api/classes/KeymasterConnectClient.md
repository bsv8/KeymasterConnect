[keymaster-connect](../index.md) / KeymasterConnectClient

# Class: KeymasterConnectClient

Official browser client for Keymaster Connect V1.

一个客户端关联一个完整钱包窗口，但不拥有关闭钱包的权利。It validates both the exact
message origin and the source window, correlates concurrent requests by id,
supports protocol cancellation through `AbortSignal`, and keeps persistent
Connect sessions separate from the window transport lifecycle.

## Examples

**Direct popup login**

```ts
const keymaster = new KeymasterConnectClient({
  targetOrigin: keymasterDeploymentOrigin
});

const session = await keymaster.login({
  text: "Sign in to Example",
  claims: ["profile.name"]
});
```

**appView launch**

```ts
const keymaster = new KeymasterConnectClient({
  targetOrigin: sessionWindowOrigin,
  mode: "appView"
});

await keymaster.connect();
const session = await keymaster.launch({ launchToken });
```

## Connect

建立、撤销或启动 Connect 连接。

### login()

> **login**(`params`, `options?`): `Promise`\<[`ConnectLoginResult`](../interfaces/ConnectLoginResult.md)\>

Calls `connect.login` to create a persistent Connect session.

#### Parameters

##### params

[`ConnectLoginParams`](../interfaces/ConnectLoginParams.md)

##### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

#### Returns

`Promise`\<[`ConnectLoginResult`](../interfaces/ConnectLoginResult.md)\>

***

### logout()

> **logout**(`options?`): `Promise`\<[`ConnectLogoutResult`](../interfaces/ConnectLogoutResult.md)\>

Calls `connect.logout` to revoke a persistent Connect session.

#### Parameters

##### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

#### Returns

`Promise`\<[`ConnectLogoutResult`](../interfaces/ConnectLogoutResult.md)\>

***

### launch()

> **launch**(`params`, `options?`): `Promise`\<[`ConnectLaunchResult`](../interfaces/ConnectLaunchResult.md)\>

Calls `connect.launch` to consume the one-time launch token of an appView
session.

#### Parameters

##### params

[`ConnectLaunchParams`](../interfaces/ConnectLaunchParams.md)

##### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

#### Returns

`Promise`\<[`ConnectLaunchResult`](../interfaces/ConnectLaunchResult.md)\>

## Identity

Read signed identity claims or sign an application intent.

### identityGet()

> **identityGet**(`params`, `options?`): `Promise`\<[`IdentityGetResult`](../interfaces/IdentityGetResult.md)\>

Calls `identity.get` to return signed identity claims for the session
owner.

#### Parameters

##### params

[`IdentityGetParams`](../interfaces/IdentityGetParams.md)

##### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

#### Returns

`Promise`\<[`IdentityGetResult`](../interfaces/IdentityGetResult.md)\>

***

### intentSign()

> **intentSign**(`params`, `options?`): `Promise`\<[`IntentSignResult`](../interfaces/IntentSignResult.md)\>

Calls `intent.sign` to sign caller-provided bytes with a human-readable
intent.

#### Parameters

##### params

[`IntentSignParams`](../interfaces/IntentSignParams.md)

##### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

#### Returns

`Promise`\<[`IntentSignResult`](../interfaces/IntentSignResult.md)\>

## Cipher

Encrypt and decrypt origin-bound application data.

### cipherEncrypt()

> **cipherEncrypt**(`params`, `options?`): `Promise`\<[`CipherEncryptResult`](../interfaces/CipherEncryptResult.md)\>

Calls `cipher.encrypt` to encrypt origin-bound application data.

#### Parameters

##### params

[`CipherEncryptParams`](../interfaces/CipherEncryptParams.md)

##### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

#### Returns

`Promise`\<[`CipherEncryptResult`](../interfaces/CipherEncryptResult.md)\>

***

### cipherDecrypt()

> **cipherDecrypt**(`params`, `options?`): `Promise`\<[`CipherDecryptResult`](../interfaces/CipherDecryptResult.md)\>

Calls `cipher.decrypt` to decrypt data previously returned by
`cipher.encrypt`.

#### Parameters

##### params

[`CipherDecryptParams`](../interfaces/CipherDecryptParams.md)

##### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

#### Returns

`Promise`\<[`CipherDecryptResult`](../interfaces/CipherDecryptResult.md)\>

## Channel

Publish JSON content and manage exact-channel subscriptions. Incoming
messages arrive as `channel.message_received` events.

### channelPublish()

> **channelPublish**(`params`, `options?`): `Promise`\<[`ChannelPublishResult`](../interfaces/ChannelPublishResult.md)\>

发布到任意精确频道；owner、公钥签名和消息编号由 Keymaster 生成。

#### Parameters

##### params

[`ChannelPublishParams`](../interfaces/ChannelPublishParams.md)

##### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

#### Returns

`Promise`\<[`ChannelPublishResult`](../interfaces/ChannelPublishResult.md)\>

***

### channelSubscriptionSet()

> **channelSubscriptionSet**(`params`, `options?`): `Promise`\<[`ChannelSubscriptionSetResult`](../interfaces/ChannelSubscriptionSetResult.md)\>

替换当前 Connect caller 的精确频道订阅集合；传空数组表示释放。

#### Parameters

##### params

[`ChannelSubscriptionSetParams`](../interfaces/ChannelSubscriptionSetParams.md)

##### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

#### Returns

`Promise`\<[`ChannelSubscriptionSetResult`](../interfaces/ChannelSubscriptionSetResult.md)\>

## Transport

Manage the Session Window and send lower-level protocol requests.

### state

#### Get Signature

> **get** **state**(): [`KeymasterConnectState`](../type-aliases/KeymasterConnectState.md)

Current browser transport state.

##### Returns

[`KeymasterConnectState`](../type-aliases/KeymasterConnectState.md)

***

### connect()

> **connect**(): `Promise`\<`void`\>

Establishes the browser transport.

#### Returns

`Promise`\<`void`\>

***

### request()

> **request**\<`M`\>(`method`, `params`, `options?`): `Promise`\<[`MethodResult`](../type-aliases/MethodResult.md)\<`M`\>\>

Sends any public Connect method with compile-time parameter and result
inference.

#### Type Parameters

##### M

`M` *extends* `"identity.get"` \| `"intent.sign"` \| `"cipher.encrypt"` \| `"cipher.decrypt"` \| `"payment.pay"` \| `"payment.status"` \| `"payment.prepare"` \| `"payment.commit"` \| `"payment.cancel"` \| `"chain.get_height"` \| `"chain.list_script_history"` \| `"chain.get_transaction"` \| `"chain.get_transactions"` \| `"chain.list_script_unspent"` \| `"chain.broadcast"` \| `"application.key"` \| `"application.sign_message"` \| `"application.sign_payment"` \| `"msfile.seller.status"` \| `"msfile.import"` \| `"msfile.content.read"` \| `"msfile.content.status"` \| `"msfile.content.open"` \| `"msfile.content.price"` \| `"msfile.content.range"` \| `"msfile.streamseed.follow"` \| `"msfile.streamseed.read"` \| `"domain.profiles"` \| `"domain.get_public_key"` \| `"connect.login"` \| `"connect.logout"` \| `"connect.launch"` \| `"channel.publish"` \| `"channel.subscription_set"` \| `"msfile.stat"` \| `"msfile.seed.read"` \| `"msfile.block.read"`

#### Parameters

##### method

`M`

##### params

[`MethodParams`](../type-aliases/MethodParams.md)\<`M`\>

##### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md) = `{}`

#### Returns

`Promise`\<[`MethodResult`](../type-aliases/MethodResult.md)\<`M`\>\>

***

### cancel()

> **cancel**(`requestId`, `reason?`): `boolean`

Cancels a locally pending request. Keymaster only cancels work that has not
entered execution; cancellation is therefore best-effort remotely.

#### Parameters

##### requestId

`string`

##### reason?

`unknown` = `...`

#### Returns

`boolean`

## Accessors

### networkIdentity

#### Get Signature

> **get** **networkIdentity**(): `Readonly`\<[`NetworkIdentity`](../interfaces/NetworkIdentity.md)\> \| `null`

Identity returned by the authenticated wallet, or null before establishment.

##### Returns

`Readonly`\<[`NetworkIdentity`](../interfaces/NetworkIdentity.md)\> \| `null`

## Constructors

### Constructor

> **new KeymasterConnectClient**(`options`): `KeymasterConnectClient`

#### Parameters

##### options

[`KeymasterConnectOptions`](../interfaces/KeymasterConnectOptions.md)

#### Returns

`KeymasterConnectClient`

## Methods

### registerTools()

> **registerTools**(`tools`, `options?`): `Promise`\<[`AiToolsRegistered`](../interfaces/AiToolsRegistered.md)\>

Replace this connection's tool set. Empty array unregisters all tools. Re-register explicitly after reconnect.

#### Parameters

##### tools

[`AiTool`](../interfaces/AiTool.md)[]

##### options?

`Pick`\<[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md), `"signal"` \| `"timeoutMs"`\> = `{}`

#### Returns

`Promise`\<[`AiToolsRegistered`](../interfaces/AiToolsRegistered.md)\>

***

### paymentStatus()

> **paymentStatus**(`params`, `options?`): `Promise`\<[`PaymentPayResult`](../interfaces/PaymentPayResult.md)\>

#### Parameters

##### params

[`PaymentStatusParams`](../interfaces/PaymentStatusParams.md)

##### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

#### Returns

`Promise`\<[`PaymentPayResult`](../interfaces/PaymentPayResult.md)\>

## MSFile

### msfile

> `readonly` **msfile**: `object`

File import, discovery, and reading through the wallet.

#### sellerStatus

> **sellerStatus**: (`options?`) => `Promise`\<\{ `ready`: `boolean`; \}\>

Check whether the active wallet can serve newly imported files.

##### Parameters

###### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

##### Returns

`Promise`\<\{ `ready`: `boolean`; \}\>

#### import

> **import**: (`params`, `options?`) => `Promise`\<\{ `seedHashHex`: `string`; \}\>

Import a complete file and wait for it to be available to the seller.

##### Parameters

###### params

[`MsFileImportParams`](../interfaces/MsFileImportParams.md)

###### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

##### Returns

`Promise`\<\{ `seedHashHex`: `string`; \}\>

#### read

> **read**: (`seedHashHex`, `options?`) => `Promise`\<[`MsFileContentResult`](../interfaces/MsFileContentResult.md)\>

Read a complete file by seed hash, discovering and buying it if needed.

##### Parameters

###### seedHashHex

`string`

###### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md) & `Pick`\<[`MsFileContentReadParams`](../interfaces/MsFileContentReadParams.md), `"maxFullBlockPriceSatoshis"` \| `"clientRequestId"`\>

##### Returns

`Promise`\<[`MsFileContentResult`](../interfaces/MsFileContentResult.md)\>

#### readStatus

> **readStatus**: (`clientRequestId`, `options?`) => `Promise`\<[`MsFileReadStatus`](../type-aliases/MsFileReadStatus.md)\>

Query the original resumable read without starting a new purchase.

##### Parameters

###### clientRequestId

`string`

###### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

##### Returns

`Promise`\<[`MsFileReadStatus`](../type-aliases/MsFileReadStatus.md)\>

#### openContent

> **openContent**: (`params`, `options?`) => `Promise`\<[`MsFileReadStatus`](../type-aliases/MsFileReadStatus.md)\>

Open verified content or start/resume its authorized download.

##### Parameters

###### params

[`MsFileContentOpenParams`](../type-aliases/MsFileContentOpenParams.md)

###### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

##### Returns

`Promise`\<[`MsFileReadStatus`](../type-aliases/MsFileReadStatus.md)\>

#### downloadPrice

> **downloadPrice**: (`params`, `options?`) => `Promise`\<[`MsFileDownloadPriceResult`](../interfaces/MsFileDownloadPriceResult.md)\>

Query the wallet block-price ceiling or adjust an owned running read.

##### Parameters

###### params?

[`MsFileDownloadPriceParams`](../interfaces/MsFileDownloadPriceParams.md) = `{}`

###### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

##### Returns

`Promise`\<[`MsFileDownloadPriceResult`](../interfaces/MsFileDownloadPriceResult.md)\>

#### readRange

> **readRange**: (`params`, `options?`) => `Promise`\<[`MsFileContentRangeResult`](../interfaces/MsFileContentRangeResult.md)\>

Read up to 256 KiB from verified content while its download continues.

##### Parameters

###### params

[`MsFileContentRangeParams`](../interfaces/MsFileContentRangeParams.md)

###### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

##### Returns

`Promise`\<[`MsFileContentRangeResult`](../interfaces/MsFileContentRangeResult.md)\>

#### followStream

> **followStream**: (`params`, `options?`) => `Promise`\<\{ `followed`: `boolean`; `firstNodeId`: `string`; \}\>

##### Parameters

###### params

###### clientRequestId

`string`

###### streamId

`string`

###### enabled

`boolean`

###### mode

`"live"` \| `"replay"`

###### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

##### Returns

`Promise`\<\{ `followed`: `boolean`; `firstNodeId`: `string`; \}\>

#### readStream

> **readStream**: (`params`, `options?`) => `Promise`\<\{ `status`: `"pending"` \| `"stopped"`; \} \| \{ `status`: `"end"`; `nodeId`: `string`; \} \| \{ `status`: `"available"`; `nodeId`: `string`; `blockLengths`: `number`[]; `content`: [`BinaryField`](../interfaces/BinaryField.md); \}\>

##### Parameters

###### params

###### clientRequestId

`string`

###### nodeId

`string`

###### blockOffset

`number`

###### length

`number`

###### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

##### Returns

`Promise`\<\{ `status`: `"pending"` \| `"stopped"`; \} \| \{ `status`: `"end"`; `nodeId`: `string`; \} \| \{ `status`: `"available"`; `nodeId`: `string`; `blockLengths`: `number`[]; `content`: [`BinaryField`](../interfaces/BinaryField.md); \}\>

#### stat

> **stat**: (`params`, `options?`) => `Promise`\<[`MsFileStatResult`](../interfaces/MsFileStatResult.md)\>

Check availability in the wallet and at its configured suppliers.

##### Parameters

###### params

[`MsFileStatParams`](../interfaces/MsFileStatParams.md)

###### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

##### Returns

`Promise`\<[`MsFileStatResult`](../interfaces/MsFileStatResult.md)\>

#### readSeed

> **readSeed**: (`params`, `options?`) => `Promise`\<[`MsFileReadResult`](../interfaces/MsFileReadResult.md)\>

Read a MasterSeed from a specific source. The wallet handles any purchase.

##### Parameters

###### params

[`MsFileSeedReadParams`](../interfaces/MsFileSeedReadParams.md)

###### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

##### Returns

`Promise`\<[`MsFileReadResult`](../interfaces/MsFileReadResult.md)\>

#### readBlock

> **readBlock**: (`params`, `options?`) => `Promise`\<[`MsFileReadResult`](../interfaces/MsFileReadResult.md)\>

Read a single block from a specific source. The wallet handles any purchase.

##### Parameters

###### params

[`MsFileBlockReadParams`](../interfaces/MsFileBlockReadParams.md)

###### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

##### Returns

`Promise`\<[`MsFileReadResult`](../interfaces/MsFileReadResult.md)\>

## Payment

Submit business outputs and query payment status.

### paymentPay()

> **paymentPay**(`params`, `options?`): `Promise`\<[`PaymentPayResult`](../interfaces/PaymentPayResult.md)\>

请求 `payment.pay`；资金审批、选币与持久幂等由钱包负责。
Promise resolve 不等于已广播，应检查返回状态。

#### Parameters

##### params

[`PaymentPayParams`](../interfaces/PaymentPayParams.md)

##### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

#### Returns

`Promise`\<[`PaymentPayResult`](../interfaces/PaymentPayResult.md)\>

## Properties

### domain

> `readonly` **domain**: `object`

#### profile

> **profile**: (`publicKeyHex`, `options?`) => `Promise`\<[`DomainProfile`](../interfaces/DomainProfile.md)\>

Read the primary domain's public profile for one public key.

##### Parameters

###### publicKeyHex

`string`

###### options?

[`DomainQueryOptions`](../interfaces/DomainQueryOptions.md)

##### Returns

`Promise`\<[`DomainProfile`](../interfaces/DomainProfile.md)\>

#### profiles

> **profiles**: (`publicKeys`, `__namedParameters`) => `Promise`\<[`DomainProfilesResult`](../interfaces/DomainProfilesResult.md)\>

Read public profiles in input order, with per-key errors.

##### Parameters

###### publicKeys

`string`[]

###### \_\_namedParameters?

[`DomainQueryOptions`](../interfaces/DomainQueryOptions.md) = `{}`

##### Returns

`Promise`\<[`DomainProfilesResult`](../interfaces/DomainProfilesResult.md)\>

#### getPublicKey

> **getPublicKey**: (`domain`, `__namedParameters`) => `Promise`\<`string`\>

Read the current owner's compressed public key for a domain.

##### Parameters

###### domain

`string`

###### \_\_namedParameters?

[`DomainQueryOptions`](../interfaces/DomainQueryOptions.md) = `{}`

##### Returns

`Promise`\<`string`\>

***

### payment

> `readonly` **payment**: `object`

按原业务 ID 只读查询付款状态，不自动重付或更换 ID。

#### prepare

> **prepare**: (`params`, `options?`) => `Promise`\<[`PaymentPrepareResult`](../type-aliases/PaymentPrepareResult.md)\>

##### Parameters

###### params

[`PaymentPrepareParams`](../interfaces/PaymentPrepareParams.md)

###### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

##### Returns

`Promise`\<[`PaymentPrepareResult`](../type-aliases/PaymentPrepareResult.md)\>

#### commit

> **commit**: (`params`, `options?`) => `Promise`\<[`PaymentPayResult`](../interfaces/PaymentPayResult.md)\>

##### Parameters

###### params

[`PaymentCommitParams`](../interfaces/PaymentCommitParams.md)

###### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

##### Returns

`Promise`\<[`PaymentPayResult`](../interfaces/PaymentPayResult.md)\>

#### cancel

> **cancel**: (`params`, `options?`) => `Promise`\<[`PaymentPayResult`](../interfaces/PaymentPayResult.md)\>

##### Parameters

###### params

[`PaymentReservationParams`](../interfaces/PaymentReservationParams.md)

###### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

##### Returns

`Promise`\<[`PaymentPayResult`](../interfaces/PaymentPayResult.md)\>

#### status

> **status**: (`params`, `options?`) => `Promise`\<[`PaymentPayResult`](../interfaces/PaymentPayResult.md)\>

##### Parameters

###### params

[`PaymentStatusParams`](../interfaces/PaymentStatusParams.md)

###### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

##### Returns

`Promise`\<[`PaymentPayResult`](../interfaces/PaymentPayResult.md)\>

***

### chain

> `readonly` **chain**: `object`

#### getHeight

> **getHeight**: (`options?`) => `Promise`\<[`ChainHeightResult`](../interfaces/ChainHeightResult.md)\>

一次性读取钱包已同步的链尖高度和区块哈希。

##### Parameters

###### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

##### Returns

`Promise`\<[`ChainHeightResult`](../interfaces/ChainHeightResult.md)\>

#### subscribeHeight

> **subscribeHeight**: (`handler`) => () => `void`

接收已有链尖及后续高度或哈希变化，返回退订函数。

##### Parameters

###### handler

(`height`) => `void`

##### Returns

() => `void`

#### listScriptHistory

> **listScriptHistory**: (`params`, `options?`) => `Promise`\<[`ChainScriptHistoryResult`](../interfaces/ChainScriptHistoryResult.md)\>

##### Parameters

###### params

[`ChainScriptHistoryParams`](../type-aliases/ChainScriptHistoryParams.md)

###### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

##### Returns

`Promise`\<[`ChainScriptHistoryResult`](../interfaces/ChainScriptHistoryResult.md)\>

#### getTransaction

> **getTransaction**: (`txid`, `options?`) => `Promise`\<[`ChainTransactionResult`](../type-aliases/ChainTransactionResult.md)\>

##### Parameters

###### txid

`string`

###### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md) & `object`

##### Returns

`Promise`\<[`ChainTransactionResult`](../type-aliases/ChainTransactionResult.md)\>

#### getTransactions

> **getTransactions**: (`params`, `options?`) => `Promise`\<[`ChainTransactionBatchResult`](../interfaces/ChainTransactionBatchResult.md)\>

Observe up to 20 transactions with optional raw bytes and no block position lookup.

##### Parameters

###### params

[`ChainTransactionBatchParams`](../type-aliases/ChainTransactionBatchParams.md)

###### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

##### Returns

`Promise`\<[`ChainTransactionBatchResult`](../interfaces/ChainTransactionBatchResult.md)\>

#### listScriptUnspent

> **listScriptUnspent**: (`script`, `options?`) => `Promise`\<\{ `outputs`: [`ChainOutpoint`](../interfaces/ChainOutpoint.md) & `object`[]; \}\>

##### Parameters

###### script

`string`

###### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

##### Returns

`Promise`\<\{ `outputs`: [`ChainOutpoint`](../interfaces/ChainOutpoint.md) & `object`[]; \}\>

#### broadcast

> **broadcast**: (`rawTxHex`, `options?`) => `Promise`\<[`ChainBroadcastResult`](../interfaces/ChainBroadcastResult.md)\>

##### Parameters

###### rawTxHex

`string`

###### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

##### Returns

`Promise`\<[`ChainBroadcastResult`](../interfaces/ChainBroadcastResult.md)\>

***

### application

> `readonly` **application**: `object`

#### getPublicKey

> **getPublicKey**: (`purpose`, `options?`) => `Promise`\<\{ `publicKeyHex`: `string`; \}\>

##### Parameters

###### purpose

`string`

###### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

##### Returns

`Promise`\<\{ `publicKeyHex`: `string`; \}\>

#### signMessage

> **signMessage**: (`params`, `options?`) => `Promise`\<\{ `publicKeyHex`: `string`; `signature`: [`BinaryField`](../interfaces/BinaryField.md); \}\>

##### Parameters

###### params

###### purpose

`string`

###### message

[`BinaryField`](../interfaces/BinaryField.md)

###### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

##### Returns

`Promise`\<\{ `publicKeyHex`: `string`; `signature`: [`BinaryField`](../interfaces/BinaryField.md); \}\>

#### signPayment

> **signPayment**: (`params`, `options?`) => `Promise`\<\{ `rawTxHex`: `string`; \}\>

##### Parameters

###### params

[`ApplicationPaymentParams`](../interfaces/ApplicationPaymentParams.md)

###### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

##### Returns

`Promise`\<\{ `rawTxHex`: `string`; \}\>
