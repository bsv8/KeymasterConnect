[keymaster-connect](../index.md) / PaymentPayResult

# Interface: PaymentPayResult

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`paymentId`](#paymentid) | `string` | Yes | — |
| [`clientRequestId`](#clientrequestid) | `string` | Yes | — |
| [`status`](#status) | [`ConnectPaymentStatus`](../type-aliases/ConnectPaymentStatus.md) | Yes | — |
| [`assetId`](#assetid) | [`P2pkhTransferAssetId`](../type-aliases/P2pkhTransferAssetId.md) | Yes | — |
| [`paymentType`](#paymenttype) | [`ConnectPaymentType`](../type-aliases/ConnectPaymentType.md) | Yes | — |
| [`recipientOwnership`](#recipientownership) | [`ConnectPaymentRecipientOwnership`](../type-aliases/ConnectPaymentRecipientOwnership.md) | Yes | — |
| [`txid?`](#txid) | `string` | No | 只有 accepted/already_known 才有 canonical txid。 |
| [`feeSatoshis?`](#feesatoshis) | `number` | No | — |
| [`changeSatoshis?`](#changesatoshis) | `number` | No | — |
| [`approval?`](#approval) | `"unknown"` \| `"automatic"` \| `"manual"` | No | — |
| [`reason?`](#reason) | `string` | No | 稳定原因码；不包含签名/交易原文。 |
| [`release?`](#release) | [`PaymentReleaseSummary`](PaymentReleaseSummary.md) | No | — |

## Properties

### paymentId

> **paymentId**: `string`

***

### clientRequestId

> **clientRequestId**: `string`

***

### status

> **status**: [`ConnectPaymentStatus`](../type-aliases/ConnectPaymentStatus.md)

***

### assetId

> **assetId**: [`P2pkhTransferAssetId`](../type-aliases/P2pkhTransferAssetId.md)

***

### paymentType

> **paymentType**: [`ConnectPaymentType`](../type-aliases/ConnectPaymentType.md)

***

### recipientOwnership

> **recipientOwnership**: [`ConnectPaymentRecipientOwnership`](../type-aliases/ConnectPaymentRecipientOwnership.md)

***

### txid?

> `optional` **txid?**: `string`

只有 accepted/already_known 才有 canonical txid。

***

### feeSatoshis?

> `optional` **feeSatoshis?**: `number`

***

### changeSatoshis?

> `optional` **changeSatoshis?**: `number`

***

### approval?

> `optional` **approval?**: `"unknown"` \| `"automatic"` \| `"manual"`

***

### reason?

> `optional` **reason?**: `string`

稳定原因码；不包含签名/交易原文。

***

### release?

> `optional` **release?**: [`PaymentReleaseSummary`](PaymentReleaseSummary.md)
