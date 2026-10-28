[keymaster-connect](../index.md) / parseRequestMessage

# Function: parseRequestMessage()

> **parseRequestMessage**(`raw`, `receiverIdentity`): `object`

公开请求只含业务参数；可信钱包身份来自接收端宿主，而不是消息字段。

## Parameters

### raw

`unknown`

### receiverIdentity

[`NetworkIdentity`](../interfaces/NetworkIdentity.md)

## Returns

`object`

### id

> **id**: `string`

### method

> **method**: `"identity.get"` \| `"intent.sign"` \| `"cipher.encrypt"` \| `"cipher.decrypt"` \| `"p2pkh.transfer"` \| `"payment.pay"` \| `"payment.status"` \| `"payment.channel.register"` \| `"connect.login"` \| `"connect.resume"` \| `"connect.logout"` \| `"connect.launch"` \| `"channel.publish"` \| `"channel.subscription_set"` \| `"storage.list"` \| `"storage.directory.create"` \| `"storage.directory.delete"` \| `"storage.put"` \| `"storage.get"` \| `"storage.delete"` \| `"msfile.stat"` \| `"msfile.seed.read"` \| `"msfile.block.read"`

### params

> **params**: [`ChannelPublishParams`](../interfaces/ChannelPublishParams.md) \| [`ChannelSubscriptionSetParams`](../interfaces/ChannelSubscriptionSetParams.md) \| [`StorageListParams`](../interfaces/StorageListParams.md) \| [`StorageDirectoryParams`](../interfaces/StorageDirectoryParams.md) \| [`StoragePutParams`](../interfaces/StoragePutParams.md) \| [`StorageGetParams`](../interfaces/StorageGetParams.md) \| [`StorageDeleteParams`](../interfaces/StorageDeleteParams.md) \| [`MsFileStatParams`](../interfaces/MsFileStatParams.md) \| [`MsFileSeedReadParams`](../interfaces/MsFileSeedReadParams.md) \| [`MsFileBlockReadParams`](../interfaces/MsFileBlockReadParams.md) \| [`IdentityGetParams`](../interfaces/IdentityGetParams.md) \| [`IntentSignParams`](../interfaces/IntentSignParams.md) \| [`CipherEncryptParams`](../interfaces/CipherEncryptParams.md) \| [`CipherDecryptParams`](../interfaces/CipherDecryptParams.md) \| [`PaymentChannelRegisterParams`](../interfaces/PaymentChannelRegisterParams.md) \| [`P2pkhTransferParams`](../interfaces/P2pkhTransferParams.md) \| [`PaymentPayParams`](../interfaces/PaymentPayParams.md) \| [`PaymentStatusParams`](../interfaces/PaymentStatusParams.md) \| [`ConnectLoginParams`](../interfaces/ConnectLoginParams.md) \| [`ConnectResumeParams`](../interfaces/ConnectResumeParams.md) \| [`ConnectLogoutParams`](../interfaces/ConnectLogoutParams.md) \| [`ConnectLaunchParams`](../interfaces/ConnectLaunchParams.md)
