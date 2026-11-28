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

> **method**: `"identity.get"` \| `"intent.sign"` \| `"cipher.encrypt"` \| `"cipher.decrypt"` \| `"payment.pay"` \| `"payment.status"` \| `"payment.prepare"` \| `"payment.commit"` \| `"payment.cancel"` \| `"chain.get_height"` \| `"chain.list_script_history"` \| `"chain.get_transaction"` \| `"chain.get_transactions"` \| `"chain.list_script_unspent"` \| `"chain.broadcast"` \| `"application.key"` \| `"application.sign_message"` \| `"application.sign_payment"` \| `"msfile.seller.status"` \| `"msfile.import"` \| `"msfile.content.read"` \| `"msfile.content.status"` \| `"msfile.content.open"` \| `"msfile.content.price"` \| `"msfile.content.range"` \| `"msfile.streamseed.follow"` \| `"msfile.streamseed.read"` \| `"domain.profiles"` \| `"domain.get_public_key"` \| `"connect.login"` \| `"connect.logout"` \| `"connect.launch"` \| `"channel.publish"` \| `"channel.subscription_set"` \| `"msfile.stat"` \| `"msfile.seed.read"` \| `"msfile.block.read"`

### params

> **params**: [`ChannelPublishParams`](../interfaces/ChannelPublishParams.md) \| [`ChannelSubscriptionSetParams`](../interfaces/ChannelSubscriptionSetParams.md) \| [`MsFileStatParams`](../interfaces/MsFileStatParams.md) \| [`MsFileContentReadParams`](../interfaces/MsFileContentReadParams.md) \| [`MsFileReadStatusParams`](../interfaces/MsFileReadStatusParams.md) \| [`MsFileContentOpenParams`](../type-aliases/MsFileContentOpenParams.md) \| [`MsFileDownloadPriceParams`](../interfaces/MsFileDownloadPriceParams.md) \| [`MsFileContentRangeParams`](../interfaces/MsFileContentRangeParams.md) \| [`MsFileSeedReadParams`](../interfaces/MsFileSeedReadParams.md) \| [`MsFileBlockReadParams`](../interfaces/MsFileBlockReadParams.md) \| [`IdentityGetParams`](../interfaces/IdentityGetParams.md) \| [`IntentSignParams`](../interfaces/IntentSignParams.md) \| [`CipherEncryptParams`](../interfaces/CipherEncryptParams.md) \| [`CipherDecryptParams`](../interfaces/CipherDecryptParams.md) \| [`PaymentPayParams`](../interfaces/PaymentPayParams.md) \| [`PaymentStatusParams`](../interfaces/PaymentStatusParams.md) \| [`PaymentPrepareParams`](../interfaces/PaymentPrepareParams.md) \| [`PaymentReservationParams`](../interfaces/PaymentReservationParams.md) \| [`PaymentCommitParams`](../interfaces/PaymentCommitParams.md) \| [`ChainScriptHistoryParams`](../type-aliases/ChainScriptHistoryParams.md) \| [`ChainTransactionBatchParams`](../type-aliases/ChainTransactionBatchParams.md) \| [`ApplicationPaymentParams`](../interfaces/ApplicationPaymentParams.md) \| [`MsFileImportParams`](../interfaces/MsFileImportParams.md) \| [`ConnectLoginParams`](../interfaces/ConnectLoginParams.md) \| [`ConnectLogoutParams`](../interfaces/ConnectLogoutParams.md) \| `Record`\<`string`, `never`\> \| [`ConnectLaunchParams`](../interfaces/ConnectLaunchParams.md) \| [`DomainProfilesParams`](../interfaces/DomainProfilesParams.md) \| [`DomainGetPublicKeyParams`](../interfaces/DomainGetPublicKeyParams.md) \| \{ `txid`: `string`; `observedRawTxHex?`: `string`; \} \| \{ `script`: `string`; \} \| \{ `rawTxHex`: `string`; \} \| \{ `purpose`: `string`; \} \| \{ `purpose`: `string`; `message`: [`BinaryField`](../interfaces/BinaryField.md); \} \| \{ `clientRequestId`: `string`; `streamId`: `string`; `enabled`: `boolean`; `mode`: `"live"` \| `"replay"`; \} \| \{ `clientRequestId`: `string`; `nodeId`: `string`; `blockOffset`: `number`; `length`: `number`; \}
