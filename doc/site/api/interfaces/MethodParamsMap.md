[keymaster-connect](../index.md) / MethodParamsMap

# Interface: MethodParamsMap

方法 -> 请求参数类型 的映射。`MethodParams<M>` 是计算出的参数类型。
业务代码里直接 `MethodParams<"identity.get">` 等价于 `IdentityGetParams`。

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`identity.get`](#identityget) | [`IdentityGetParams`](IdentityGetParams.md) | Yes | — |
| [`intent.sign`](#intentsign) | [`IntentSignParams`](IntentSignParams.md) | Yes | — |
| [`cipher.encrypt`](#cipherencrypt) | [`CipherEncryptParams`](CipherEncryptParams.md) | Yes | — |
| [`cipher.decrypt`](#cipherdecrypt) | [`CipherDecryptParams`](CipherDecryptParams.md) | Yes | — |
| [`payment.pay`](#paymentpay) | [`PaymentPayParams`](PaymentPayParams.md) | Yes | — |
| [`payment.status`](#paymentstatus) | [`PaymentStatusParams`](PaymentStatusParams.md) | Yes | — |
| [`payment.prepare`](#paymentprepare) | [`PaymentPrepareParams`](PaymentPrepareParams.md) | Yes | — |
| [`payment.commit`](#paymentcommit) | [`PaymentCommitParams`](PaymentCommitParams.md) | Yes | — |
| [`payment.cancel`](#paymentcancel) | [`PaymentReservationParams`](PaymentReservationParams.md) | Yes | — |
| [`chain.get_height`](#chainget-height) | `object` | Yes | — |
| [`chain.list_script_history`](#chainlist-script-history) | [`ChainScriptHistoryParams`](../type-aliases/ChainScriptHistoryParams.md) | Yes | — |
| [`chain.get_transaction`](#chainget-transaction) | `object` | Yes | — |
| [`chain.get_transactions`](#chainget-transactions) | [`ChainTransactionBatchParams`](../type-aliases/ChainTransactionBatchParams.md) | Yes | — |
| [`chain.list_script_unspent`](#chainlist-script-unspent) | `object` | Yes | — |
| [`chain.broadcast`](#chainbroadcast) | `object` | Yes | — |
| [`application.key`](#applicationkey) | `object` | Yes | — |
| [`application.sign_message`](#applicationsign-message) | `object` | Yes | — |
| [`application.sign_payment`](#applicationsign-payment) | [`ApplicationPaymentParams`](ApplicationPaymentParams.md) | Yes | — |
| [`msfile.seller.status`](#msfilesellerstatus) | `object` | Yes | — |
| [`msfile.import`](#msfileimport) | [`MsFileImportParams`](MsFileImportParams.md) | Yes | — |
| [`msfile.content.read`](#msfilecontentread) | [`MsFileContentReadParams`](MsFileContentReadParams.md) | Yes | — |
| [`msfile.content.status`](#msfilecontentstatus) | [`MsFileReadStatusParams`](MsFileReadStatusParams.md) | Yes | — |
| [`msfile.content.open`](#msfilecontentopen) | [`MsFileContentOpenParams`](../type-aliases/MsFileContentOpenParams.md) | Yes | — |
| [`msfile.content.price`](#msfilecontentprice) | [`MsFileDownloadPriceParams`](MsFileDownloadPriceParams.md) | Yes | — |
| [`msfile.content.range`](#msfilecontentrange) | [`MsFileContentRangeParams`](MsFileContentRangeParams.md) | Yes | — |
| [`domain.profiles`](#domainprofiles) | [`DomainProfilesParams`](DomainProfilesParams.md) | Yes | — |
| [`domain.get_public_key`](#domainget-public-key) | [`DomainGetPublicKeyParams`](DomainGetPublicKeyParams.md) | Yes | — |
| [`connect.login`](#connectlogin) | [`ConnectLoginParams`](ConnectLoginParams.md) | Yes | — |
| [`connect.logout`](#connectlogout) | [`ConnectLogoutParams`](ConnectLogoutParams.md) | Yes | — |
| [`connect.launch`](#connectlaunch) | [`ConnectLaunchParams`](ConnectLaunchParams.md) | Yes | — |
| [`channel.publish`](#channelpublish) | [`ChannelPublishParams`](ChannelPublishParams.md) | Yes | — |
| [`channel.subscription_set`](#channelsubscription-set) | [`ChannelSubscriptionSetParams`](ChannelSubscriptionSetParams.md) | Yes | — |
| [`msfile.stat`](#msfilestat) | [`MsFileStatParams`](MsFileStatParams.md) | Yes | — |
| [`msfile.seed.read`](#msfileseedread) | [`MsFileSeedReadParams`](MsFileSeedReadParams.md) | Yes | — |
| [`msfile.block.read`](#msfileblockread) | [`MsFileBlockReadParams`](MsFileBlockReadParams.md) | Yes | — |

## Properties

### identity.get

> **identity.get**: [`IdentityGetParams`](IdentityGetParams.md)

***

### intent.sign

> **intent.sign**: [`IntentSignParams`](IntentSignParams.md)

***

### cipher.encrypt

> **cipher.encrypt**: [`CipherEncryptParams`](CipherEncryptParams.md)

***

### cipher.decrypt

> **cipher.decrypt**: [`CipherDecryptParams`](CipherDecryptParams.md)

***

### payment.pay

> **payment.pay**: [`PaymentPayParams`](PaymentPayParams.md)

***

### payment.status

> **payment.status**: [`PaymentStatusParams`](PaymentStatusParams.md)

***

### payment.prepare

> **payment.prepare**: [`PaymentPrepareParams`](PaymentPrepareParams.md)

***

### payment.commit

> **payment.commit**: [`PaymentCommitParams`](PaymentCommitParams.md)

***

### payment.cancel

> **payment.cancel**: [`PaymentReservationParams`](PaymentReservationParams.md)

***

### chain.get\_height

> **chain.get\_height**: `object`

***

### chain.list\_script\_history

> **chain.list\_script\_history**: [`ChainScriptHistoryParams`](../type-aliases/ChainScriptHistoryParams.md)

***

### chain.get\_transaction

> **chain.get\_transaction**: `object`

#### txid

> **txid**: `string`

#### observedRawTxHex?

> `optional` **observedRawTxHex?**: `string`

***

### chain.get\_transactions

> **chain.get\_transactions**: [`ChainTransactionBatchParams`](../type-aliases/ChainTransactionBatchParams.md)

***

### chain.list\_script\_unspent

> **chain.list\_script\_unspent**: `object`

#### script

> **script**: `string`

***

### chain.broadcast

> **chain.broadcast**: `object`

#### rawTxHex

> **rawTxHex**: `string`

***

### application.key

> **application.key**: `object`

#### purpose

> **purpose**: `string`

***

### application.sign\_message

> **application.sign\_message**: `object`

#### purpose

> **purpose**: `string`

#### message

> **message**: [`BinaryField`](BinaryField.md)

***

### application.sign\_payment

> **application.sign\_payment**: [`ApplicationPaymentParams`](ApplicationPaymentParams.md)

***

### msfile.seller.status

> **msfile.seller.status**: `object`

***

### msfile.import

> **msfile.import**: [`MsFileImportParams`](MsFileImportParams.md)

***

### msfile.content.read

> **msfile.content.read**: [`MsFileContentReadParams`](MsFileContentReadParams.md)

***

### msfile.content.status

> **msfile.content.status**: [`MsFileReadStatusParams`](MsFileReadStatusParams.md)

***

### msfile.content.open

> **msfile.content.open**: [`MsFileContentOpenParams`](../type-aliases/MsFileContentOpenParams.md)

***

### msfile.content.price

> **msfile.content.price**: [`MsFileDownloadPriceParams`](MsFileDownloadPriceParams.md)

***

### msfile.content.range

> **msfile.content.range**: [`MsFileContentRangeParams`](MsFileContentRangeParams.md)

***

### domain.profiles

> **domain.profiles**: [`DomainProfilesParams`](DomainProfilesParams.md)

***

### domain.get\_public\_key

> **domain.get\_public\_key**: [`DomainGetPublicKeyParams`](DomainGetPublicKeyParams.md)

***

### connect.login

> **connect.login**: [`ConnectLoginParams`](ConnectLoginParams.md)

***

### connect.logout

> **connect.logout**: [`ConnectLogoutParams`](ConnectLogoutParams.md)

***

### connect.launch

> **connect.launch**: [`ConnectLaunchParams`](ConnectLaunchParams.md)

***

### channel.publish

> **channel.publish**: [`ChannelPublishParams`](ChannelPublishParams.md)

***

### channel.subscription\_set

> **channel.subscription\_set**: [`ChannelSubscriptionSetParams`](ChannelSubscriptionSetParams.md)

***

### msfile.stat

> **msfile.stat**: [`MsFileStatParams`](MsFileStatParams.md)

***

### msfile.seed.read

> **msfile.seed.read**: [`MsFileSeedReadParams`](MsFileSeedReadParams.md)

***

### msfile.block.read

> **msfile.block.read**: [`MsFileBlockReadParams`](MsFileBlockReadParams.md)
