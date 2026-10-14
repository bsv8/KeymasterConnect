[@keymaster/connect](../index.md) / KeymasterConnectClient

# Class: KeymasterConnectClient

Official browser client for Keymaster Connect V1.

One client owns one reusable Session Window. It validates both the exact
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
const session = await keymaster.launch({ launchToken, appIdentity });
```

## Connect

Create, restore, revoke, or launch a persistent Connect session.

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

### resume()

> **resume**(`connectSessionId`, `options?`): `Promise`\<[`ConnectResumeResult`](../interfaces/ConnectResumeResult.md)\>

Calls `connect.resume` to restore the unlock runtime for a persistent
session.

#### Parameters

##### connectSessionId

`string`

##### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

#### Returns

`Promise`\<[`ConnectResumeResult`](../interfaces/ConnectResumeResult.md)\>

***

### logout()

> **logout**(`connectSessionId`, `options?`): `Promise`\<[`ConnectLogoutResult`](../interfaces/ConnectLogoutResult.md)\>

Calls `connect.logout` to revoke a persistent Connect session.

#### Parameters

##### connectSessionId

`string`

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

## Transfer

Request a controlled BSV transfer.

### p2pkhTransfer()

> **p2pkhTransfer**(`params`, `options?`): `Promise`\<[`P2pkhTransferResult`](../interfaces/P2pkhTransferResult.md)\>

Calls `p2pkh.transfer` to request a controlled mainnet BSV transfer.

#### Parameters

##### params

[`P2pkhTransferParams`](../interfaces/P2pkhTransferParams.md)

##### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

#### Returns

`Promise`\<[`P2pkhTransferResult`](../interfaces/P2pkhTransferResult.md)\>

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

## Storage

Manage app-scoped directories, objects, and multipart uploads.

### storageList()

> **storageList**(`params`, `options?`): `Promise`\<[`StorageListResult`](../interfaces/StorageListResult.md)\>

Calls `storage.list` to list paths in the verified application's namespace.

#### Parameters

##### params

[`StorageListParams`](../interfaces/StorageListParams.md)

##### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

#### Returns

`Promise`\<[`StorageListResult`](../interfaces/StorageListResult.md)\>

***

### storageDirectoryCreate()

> **storageDirectoryCreate**(`params`, `options?`): `Promise`\<[`StorageDirectoryResult`](../interfaces/StorageDirectoryResult.md)\>

Calls `storage.directory.create` to create an app-scoped directory.

#### Parameters

##### params

[`StorageDirectoryParams`](../interfaces/StorageDirectoryParams.md)

##### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

#### Returns

`Promise`\<[`StorageDirectoryResult`](../interfaces/StorageDirectoryResult.md)\>

***

### storageDirectoryDelete()

> **storageDirectoryDelete**(`params`, `options?`): `Promise`\<[`StorageDirectoryResult`](../interfaces/StorageDirectoryResult.md)\>

Calls `storage.directory.delete` to delete an app-scoped directory.

#### Parameters

##### params

[`StorageDirectoryParams`](../interfaces/StorageDirectoryParams.md)

##### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

#### Returns

`Promise`\<[`StorageDirectoryResult`](../interfaces/StorageDirectoryResult.md)\>

***

### storagePut()

> **storagePut**(`params`, `options?`): `Promise`\<[`StoragePutResult`](../interfaces/StoragePutResult.md)\>

Calls `storage.put` to write an app-scoped object.

#### Parameters

##### params

[`StoragePutParams`](../interfaces/StoragePutParams.md)

##### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

#### Returns

`Promise`\<[`StoragePutResult`](../interfaces/StoragePutResult.md)\>

***

### storageGet()

> **storageGet**(`params`, `options?`): `Promise`\<[`StorageGetResult`](../interfaces/StorageGetResult.md)\>

Calls `storage.get` to read an app-scoped object.

#### Parameters

##### params

[`StorageGetParams`](../interfaces/StorageGetParams.md)

##### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

#### Returns

`Promise`\<[`StorageGetResult`](../interfaces/StorageGetResult.md)\>

***

### storageDelete()

> **storageDelete**(`params`, `options?`): `Promise`\<[`StorageDeleteResult`](../interfaces/StorageDeleteResult.md)\>

Calls `storage.delete` to delete an app-scoped object.

#### Parameters

##### params

[`StorageDeleteParams`](../interfaces/StorageDeleteParams.md)

##### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

#### Returns

`Promise`\<[`StorageDeleteResult`](../interfaces/StorageDeleteResult.md)\>

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

Popup mode opens the Session Window and waits for `ready`. appView mode
adopts `window.opener`, installs the listener, and sends the child `ready`
message without ever opening a fallback popup.

#### Returns

`Promise`\<`void`\>

***

### request()

> **request**\<`M`\>(`method`, `params`, `options?`): `Promise`\<[`MethodResult`](../type-aliases/MethodResult.md)\<`M`\>\>

Sends any public Connect method with compile-time parameter and result
inference.

#### Type Parameters

##### M

`M` *extends* [`ProtocolMethod`](../type-aliases/ProtocolMethod.md)

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

***

### close()

> **close**(): `void`

Tears down the local transport. This does not revoke persistent Connect
sessions; call [logout](#logout) before closing when revocation is required.

#### Returns

`void`

## Constructors

### Constructor

> **new KeymasterConnectClient**(`options`): `KeymasterConnectClient`

#### Parameters

##### options

[`KeymasterConnectOptions`](../interfaces/KeymasterConnectOptions.md)

#### Returns

`KeymasterConnectClient`

## Methods

### registerPaymentChannel()

> **registerPaymentChannel**(`params`, `options?`): `Promise`\<[`PaymentChannelRegisterResult`](../interfaces/PaymentChannelRegisterResult.md)\>

注册零额度渠道；用户在钱包设置额度后，付款携带返回的 channelId。

#### Parameters

##### params

[`PaymentChannelRegisterParams`](../interfaces/PaymentChannelRegisterParams.md)

##### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

#### Returns

`Promise`\<[`PaymentChannelRegisterResult`](../interfaces/PaymentChannelRegisterResult.md)\>

## MSFile

### msfileStat()

> **msfileStat**(`params`, `options?`): `Promise`\<[`MsFileStatResult`](../interfaces/MsFileStatResult.md)\>

Calls `msfile.stat` to query every enabled MSFile supplier for a seed
hash. The caller selects supplier/hash only; price policy stays inside
Keymaster.

#### Parameters

##### params

[`MsFileStatParams`](../interfaces/MsFileStatParams.md)

##### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

#### Returns

`Promise`\<[`MsFileStatResult`](../interfaces/MsFileStatResult.md)\>

***

### msfileReadSeed()

> **msfileReadSeed**(`params`, `options?`): `Promise`\<[`MsFileReadResult`](../interfaces/MsFileReadResult.md)\>

Calls `msfile.seed.read` to buy and read a MasterSeed by hash. There is no
price parameter: Keymaster resolves the amount from its settings or asks
the user for approval when needed.

#### Parameters

##### params

[`MsFileSeedReadParams`](../interfaces/MsFileSeedReadParams.md)

##### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

#### Returns

`Promise`\<[`MsFileReadResult`](../interfaces/MsFileReadResult.md)\>

***

### msfileReadBlock()

> **msfileReadBlock**(`params`, `options?`): `Promise`\<[`MsFileReadResult`](../interfaces/MsFileReadResult.md)\>

Calls `msfile.block.read` to buy and read a single file block by hash.
Like [msfileReadSeed](#msfilereadseed), no caller-supplied price is accepted.

#### Parameters

##### params

[`MsFileBlockReadParams`](../interfaces/MsFileBlockReadParams.md)

##### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

#### Returns

`Promise`\<[`MsFileReadResult`](../interfaces/MsFileReadResult.md)\>

## Price

Read the Keymaster display price (amount + unit) once, or subscribe to
`price.changed` pushes. The price is display-only reference data.

### priceGet()

> **priceGet**(`params`, `options?`): `Promise`\<[`PriceValue`](../interfaces/PriceValue.md)\>

一次读取 Keymaster 当前的 BSV 展示价格（金额 + 单位）。

未就绪（未配置 / 未收到快照 / 订阅出错）时返回 `amount: "0.00"`；
价格只作显示参考，不用于业务判断。

#### Parameters

##### params

[`PriceGetParams`](../interfaces/PriceGetParams.md)

##### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

#### Returns

`Promise`\<[`PriceValue`](../interfaces/PriceValue.md)\>

***

### priceSubscribe()

> **priceSubscribe**(`params`, `options?`): `Promise`\<[`PriceSubscriptionResult`](../interfaces/PriceSubscriptionResult.md)\>

订阅 `price.changed` 推送；订阅前不会收到价格事件。

#### Parameters

##### params

[`PriceSubscribeParams`](../interfaces/PriceSubscribeParams.md)

##### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

#### Returns

`Promise`\<[`PriceSubscriptionResult`](../interfaces/PriceSubscriptionResult.md)\>

***

### priceUnsubscribe()

> **priceUnsubscribe**(`params`, `options?`): `Promise`\<[`PriceSubscriptionResult`](../interfaces/PriceSubscriptionResult.md)\>

取消当前会话的 `price.changed` 推送。

#### Parameters

##### params

[`PriceSubscribeParams`](../interfaces/PriceSubscribeParams.md)

##### options?

[`KeymasterRequestOptions`](../interfaces/KeymasterRequestOptions.md)

#### Returns

`Promise`\<[`PriceSubscriptionResult`](../interfaces/PriceSubscriptionResult.md)\>

## Properties

### networkIdentity

> `readonly` **networkIdentity**: [`NetworkIdentity`](../interfaces/NetworkIdentity.md)
