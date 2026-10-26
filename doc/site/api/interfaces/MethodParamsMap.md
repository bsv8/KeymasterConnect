[keymaster-connect](../index.md) / MethodParamsMap

# Interface: MethodParamsMap

方法 -> 请求参数类型 的映射。`MethodParams<M>` 是计算出的参数类型。
业务代码里直接 `MethodParams<"identity.get">` 等价于 `IdentityGetParams`。

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`payment.channel.register`](#paymentchannelregister) | [`PaymentChannelRegisterParams`](PaymentChannelRegisterParams.md) | Yes | — |
| [`identity.get`](#identityget) | [`IdentityGetParams`](IdentityGetParams.md) | Yes | — |
| [`intent.sign`](#intentsign) | [`IntentSignParams`](IntentSignParams.md) | Yes | — |
| [`cipher.encrypt`](#cipherencrypt) | [`CipherEncryptParams`](CipherEncryptParams.md) | Yes | — |
| [`cipher.decrypt`](#cipherdecrypt) | [`CipherDecryptParams`](CipherDecryptParams.md) | Yes | — |
| [`p2pkh.transfer`](#p2pkhtransfer) | [`P2pkhTransferParams`](P2pkhTransferParams.md) | Yes | — |
| [`payment.pay`](#paymentpay) | [`PaymentPayParams`](PaymentPayParams.md) | Yes | — |
| [`payment.status`](#paymentstatus) | [`PaymentStatusParams`](PaymentStatusParams.md) | Yes | — |
| [`connect.login`](#connectlogin) | [`ConnectLoginParams`](ConnectLoginParams.md) | Yes | — |
| [`connect.resume`](#connectresume) | [`ConnectResumeParams`](ConnectResumeParams.md) | Yes | — |
| [`connect.logout`](#connectlogout) | [`ConnectLogoutParams`](ConnectLogoutParams.md) | Yes | — |
| [`connect.launch`](#connectlaunch) | [`ConnectLaunchParams`](ConnectLaunchParams.md) | Yes | — |
| [`channel.publish`](#channelpublish) | [`ChannelPublishParams`](ChannelPublishParams.md) | Yes | — |
| [`channel.subscription_set`](#channelsubscription-set) | [`ChannelSubscriptionSetParams`](ChannelSubscriptionSetParams.md) | Yes | — |
| [`price.get`](#priceget) | [`PriceGetParams`](PriceGetParams.md) | Yes | — |
| [`price.subscribe`](#pricesubscribe) | [`PriceSubscribeParams`](PriceSubscribeParams.md) | Yes | — |
| [`price.unsubscribe`](#priceunsubscribe) | [`PriceSubscribeParams`](PriceSubscribeParams.md) | Yes | — |
| [`storage.list`](#storagelist) | [`StorageListParams`](StorageListParams.md) | Yes | — |
| [`storage.directory.create`](#storagedirectorycreate) | [`StorageDirectoryParams`](StorageDirectoryParams.md) | Yes | — |
| [`storage.directory.delete`](#storagedirectorydelete) | [`StorageDirectoryParams`](StorageDirectoryParams.md) | Yes | — |
| [`storage.put`](#storageput) | [`StoragePutParams`](StoragePutParams.md) | Yes | — |
| [`storage.get`](#storageget) | [`StorageGetParams`](StorageGetParams.md) | Yes | — |
| [`storage.delete`](#storagedelete) | [`StorageDeleteParams`](StorageDeleteParams.md) | Yes | — |
| [`msfile.stat`](#msfilestat) | [`MsFileStatParams`](MsFileStatParams.md) | Yes | — |
| [`msfile.seed.read`](#msfileseedread) | [`MsFileSeedReadParams`](MsFileSeedReadParams.md) | Yes | — |
| [`msfile.block.read`](#msfileblockread) | [`MsFileBlockReadParams`](MsFileBlockReadParams.md) | Yes | — |

## Properties

### payment.channel.register

> **payment.channel.register**: [`PaymentChannelRegisterParams`](PaymentChannelRegisterParams.md)

***

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

### p2pkh.transfer

> **p2pkh.transfer**: [`P2pkhTransferParams`](P2pkhTransferParams.md)

***

### payment.pay

> **payment.pay**: [`PaymentPayParams`](PaymentPayParams.md)

***

### payment.status

> **payment.status**: [`PaymentStatusParams`](PaymentStatusParams.md)

***

### connect.login

> **connect.login**: [`ConnectLoginParams`](ConnectLoginParams.md)

***

### connect.resume

> **connect.resume**: [`ConnectResumeParams`](ConnectResumeParams.md)

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

### price.get

> **price.get**: [`PriceGetParams`](PriceGetParams.md)

***

### price.subscribe

> **price.subscribe**: [`PriceSubscribeParams`](PriceSubscribeParams.md)

***

### price.unsubscribe

> **price.unsubscribe**: [`PriceSubscribeParams`](PriceSubscribeParams.md)

***

### storage.list

> **storage.list**: [`StorageListParams`](StorageListParams.md)

***

### storage.directory.create

> **storage.directory.create**: [`StorageDirectoryParams`](StorageDirectoryParams.md)

***

### storage.directory.delete

> **storage.directory.delete**: [`StorageDirectoryParams`](StorageDirectoryParams.md)

***

### storage.put

> **storage.put**: [`StoragePutParams`](StoragePutParams.md)

***

### storage.get

> **storage.get**: [`StorageGetParams`](StorageGetParams.md)

***

### storage.delete

> **storage.delete**: [`StorageDeleteParams`](StorageDeleteParams.md)

***

### msfile.stat

> **msfile.stat**: [`MsFileStatParams`](MsFileStatParams.md)

***

### msfile.seed.read

> **msfile.seed.read**: [`MsFileSeedReadParams`](MsFileSeedReadParams.md)

***

### msfile.block.read

> **msfile.block.read**: [`MsFileBlockReadParams`](MsFileBlockReadParams.md)
