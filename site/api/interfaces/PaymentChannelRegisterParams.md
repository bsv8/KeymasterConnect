[@keymaster/connect](../index.md) / PaymentChannelRegisterParams

# Interface: PaymentChannelRegisterParams

App 注册自身支付用途；owner 始终取已连接会话的 origin，不能自报。

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`walletPublicKeyHex`](#walletpublickeyhex) | `string` | Yes | — |
| [`channelName`](#channelname) | `string` | Yes | — |
| [`paymentType`](#paymenttype) | `"p2pkh"` \| `"feepool.connect"` | Yes | — |
| [`assetId?`](#assetid) | [`P2pkhTransferAssetId`](../type-aliases/P2pkhTransferAssetId.md) | No | — |

## Properties

### walletPublicKeyHex

> **walletPublicKeyHex**: `string`

***

### channelName

> **channelName**: `string`

***

### paymentType

> **paymentType**: `"p2pkh"` \| `"feepool.connect"`

***

### assetId?

> `optional` **assetId?**: [`P2pkhTransferAssetId`](../type-aliases/P2pkhTransferAssetId.md)
