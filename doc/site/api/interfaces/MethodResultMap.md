[keymaster-connect](../index.md) / MethodResultMap

# Interface: MethodResultMap

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`identity.get`](#identityget) | [`IdentityGetResult`](IdentityGetResult.md) | Yes | — |
| [`intent.sign`](#intentsign) | [`IntentSignResult`](IntentSignResult.md) | Yes | — |
| [`cipher.encrypt`](#cipherencrypt) | [`CipherEncryptResult`](CipherEncryptResult.md) | Yes | — |
| [`cipher.decrypt`](#cipherdecrypt) | [`CipherDecryptResult`](CipherDecryptResult.md) | Yes | — |
| [`payment.pay`](#paymentpay) | [`PaymentPayResult`](PaymentPayResult.md) | Yes | — |
| [`payment.status`](#paymentstatus) | [`PaymentPayResult`](PaymentPayResult.md) | Yes | — |
| [`payment.prepare`](#paymentprepare) | [`PaymentPrepareResult`](../type-aliases/PaymentPrepareResult.md) | Yes | — |
| [`payment.commit`](#paymentcommit) | [`PaymentPayResult`](PaymentPayResult.md) | Yes | — |
| [`payment.cancel`](#paymentcancel) | [`PaymentPayResult`](PaymentPayResult.md) | Yes | — |
| [`chain.get_height`](#chainget-height) | [`ChainHeightResult`](ChainHeightResult.md) | Yes | — |
| [`chain.list_script_history`](#chainlist-script-history) | [`ChainScriptHistoryResult`](ChainScriptHistoryResult.md) | Yes | — |
| [`chain.get_transaction`](#chainget-transaction) | [`ChainTransactionResult`](../type-aliases/ChainTransactionResult.md) | Yes | — |
| [`chain.get_transactions`](#chainget-transactions) | [`ChainTransactionBatchResult`](ChainTransactionBatchResult.md) | Yes | — |
| [`chain.list_script_unspent`](#chainlist-script-unspent) | `object` | Yes | — |
| [`chain.broadcast`](#chainbroadcast) | [`ChainBroadcastResult`](ChainBroadcastResult.md) | Yes | — |
| [`application.key`](#applicationkey) | `object` | Yes | — |
| [`application.sign_message`](#applicationsign-message) | `object` | Yes | — |
| [`application.sign_payment`](#applicationsign-payment) | `object` | Yes | — |
| [`msfile.seller.status`](#msfilesellerstatus) | `object` | Yes | — |
| [`msfile.import`](#msfileimport) | `object` | Yes | — |
| [`msfile.content.read`](#msfilecontentread) | [`MsFileContentResult`](MsFileContentResult.md) | Yes | — |
| [`msfile.content.status`](#msfilecontentstatus) | [`MsFileReadStatus`](../type-aliases/MsFileReadStatus.md) | Yes | — |
| [`msfile.content.open`](#msfilecontentopen) | [`MsFileReadStatus`](../type-aliases/MsFileReadStatus.md) | Yes | — |
| [`msfile.content.price`](#msfilecontentprice) | [`MsFileDownloadPriceResult`](MsFileDownloadPriceResult.md) | Yes | — |
| [`msfile.content.range`](#msfilecontentrange) | [`MsFileContentRangeResult`](MsFileContentRangeResult.md) | Yes | — |
| [`msfile.streamseed.follow`](#msfilestreamseedfollow) | `object` | Yes | — |
| [`msfile.streamseed.read`](#msfilestreamseedread) | \{ `status`: `"pending"` \| `"stopped"`; \} \| \{ `status`: `"end"`; `nodeId`: `string`; \} \| \{ `status`: `"available"`; `nodeId`: `string`; `blockLengths`: `number`[]; `content`: [`BinaryField`](BinaryField.md); \} | Yes | — |
| [`domain.profiles`](#domainprofiles) | [`DomainProfilesResult`](DomainProfilesResult.md) | Yes | — |
| [`domain.get_public_key`](#domainget-public-key) | `object` | Yes | — |
| [`connect.login`](#connectlogin) | [`ConnectLoginResult`](ConnectLoginResult.md) | Yes | — |
| [`connect.logout`](#connectlogout) | [`ConnectLogoutResult`](ConnectLogoutResult.md) | Yes | — |
| [`connect.launch`](#connectlaunch) | [`ConnectLaunchResult`](ConnectLaunchResult.md) | Yes | — |
| [`channel.publish`](#channelpublish) | [`ChannelPublishResult`](ChannelPublishResult.md) | Yes | — |
| [`channel.subscription_set`](#channelsubscription-set) | [`ChannelSubscriptionSetResult`](ChannelSubscriptionSetResult.md) | Yes | — |
| [`msfile.stat`](#msfilestat) | [`MsFileStatResult`](MsFileStatResult.md) | Yes | — |
| [`msfile.seed.read`](#msfileseedread) | [`MsFileReadResult`](MsFileReadResult.md) | Yes | — |
| [`msfile.block.read`](#msfileblockread) | [`MsFileReadResult`](MsFileReadResult.md) | Yes | — |

## Properties

### identity.get

> **identity.get**: [`IdentityGetResult`](IdentityGetResult.md)

***

### intent.sign

> **intent.sign**: [`IntentSignResult`](IntentSignResult.md)

***

### cipher.encrypt

> **cipher.encrypt**: [`CipherEncryptResult`](CipherEncryptResult.md)

***

### cipher.decrypt

> **cipher.decrypt**: [`CipherDecryptResult`](CipherDecryptResult.md)

***

### payment.pay

> **payment.pay**: [`PaymentPayResult`](PaymentPayResult.md)

***

### payment.status

> **payment.status**: [`PaymentPayResult`](PaymentPayResult.md)

***

### payment.prepare

> **payment.prepare**: [`PaymentPrepareResult`](../type-aliases/PaymentPrepareResult.md)

***

### payment.commit

> **payment.commit**: [`PaymentPayResult`](PaymentPayResult.md)

***

### payment.cancel

> **payment.cancel**: [`PaymentPayResult`](PaymentPayResult.md)

***

### chain.get\_height

> **chain.get\_height**: [`ChainHeightResult`](ChainHeightResult.md)

***

### chain.list\_script\_history

> **chain.list\_script\_history**: [`ChainScriptHistoryResult`](ChainScriptHistoryResult.md)

***

### chain.get\_transaction

> **chain.get\_transaction**: [`ChainTransactionResult`](../type-aliases/ChainTransactionResult.md)

***

### chain.get\_transactions

> **chain.get\_transactions**: [`ChainTransactionBatchResult`](ChainTransactionBatchResult.md)

***

### chain.list\_script\_unspent

> **chain.list\_script\_unspent**: `object`

#### outputs

> **outputs**: [`ChainOutpoint`](ChainOutpoint.md) & `object`[]

***

### chain.broadcast

> **chain.broadcast**: [`ChainBroadcastResult`](ChainBroadcastResult.md)

***

### application.key

> **application.key**: `object`

#### publicKeyHex

> **publicKeyHex**: `string`

***

### application.sign\_message

> **application.sign\_message**: `object`

#### publicKeyHex

> **publicKeyHex**: `string`

#### signature

> **signature**: [`BinaryField`](BinaryField.md)

***

### application.sign\_payment

> **application.sign\_payment**: `object`

#### rawTxHex

> **rawTxHex**: `string`

***

### msfile.seller.status

> **msfile.seller.status**: `object`

#### ready

> **ready**: `boolean`

***

### msfile.import

> **msfile.import**: `object`

#### seedHashHex

> **seedHashHex**: `string`

***

### msfile.content.read

> **msfile.content.read**: [`MsFileContentResult`](MsFileContentResult.md)

***

### msfile.content.status

> **msfile.content.status**: [`MsFileReadStatus`](../type-aliases/MsFileReadStatus.md)

***

### msfile.content.open

> **msfile.content.open**: [`MsFileReadStatus`](../type-aliases/MsFileReadStatus.md)

***

### msfile.content.price

> **msfile.content.price**: [`MsFileDownloadPriceResult`](MsFileDownloadPriceResult.md)

***

### msfile.content.range

> **msfile.content.range**: [`MsFileContentRangeResult`](MsFileContentRangeResult.md)

***

### msfile.streamseed.follow

> **msfile.streamseed.follow**: `object`

#### followed

> **followed**: `boolean`

#### firstNodeId

> **firstNodeId**: `string`

***

### msfile.streamseed.read

> **msfile.streamseed.read**: \{ `status`: `"pending"` \| `"stopped"`; \} \| \{ `status`: `"end"`; `nodeId`: `string`; \} \| \{ `status`: `"available"`; `nodeId`: `string`; `blockLengths`: `number`[]; `content`: [`BinaryField`](BinaryField.md); \}

***

### domain.profiles

> **domain.profiles**: [`DomainProfilesResult`](DomainProfilesResult.md)

***

### domain.get\_public\_key

> **domain.get\_public\_key**: `object`

#### publicKeyHex

> **publicKeyHex**: `string`

***

### connect.login

> **connect.login**: [`ConnectLoginResult`](ConnectLoginResult.md)

***

### connect.logout

> **connect.logout**: [`ConnectLogoutResult`](ConnectLogoutResult.md)

***

### connect.launch

> **connect.launch**: [`ConnectLaunchResult`](ConnectLaunchResult.md)

***

### channel.publish

> **channel.publish**: [`ChannelPublishResult`](ChannelPublishResult.md)

***

### channel.subscription\_set

> **channel.subscription\_set**: [`ChannelSubscriptionSetResult`](ChannelSubscriptionSetResult.md)

***

### msfile.stat

> **msfile.stat**: [`MsFileStatResult`](MsFileStatResult.md)

***

### msfile.seed.read

> **msfile.seed.read**: [`MsFileReadResult`](MsFileReadResult.md)

***

### msfile.block.read

> **msfile.block.read**: [`MsFileReadResult`](MsFileReadResult.md)
