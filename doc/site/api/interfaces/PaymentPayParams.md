[keymaster-connect](../index.md) / PaymentPayParams

# Interface: PaymentPayParams

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`channelId`](#channelid) | `string` | Yes | — |
| [`clientRequestId`](#clientrequestid) | `string` | Yes | 稳定幂等身份，1–128 字符。 |
| [`paymentType`](#paymenttype) | [`ConnectPaymentType`](../type-aliases/ConnectPaymentType.md) | Yes | — |
| [`businessKind`](#businesskind) | `string` | Yes | App 声明的业务用途；展示时不是可信商业结论。 |
| [`amountSatoshis`](#amountsatoshis) | `number` | Yes | 业务金额（聪，不含矿工费）。 |
| [`feeRateSatoshisPerKb?`](#feeratesatoshisperkb) | `number` | No | 可选希望费率（sat/kB）。 |
| [`recipient`](#recipient) | [`ConnectPaymentRecipient`](../type-aliases/ConnectPaymentRecipient.md) | Yes | — |

## Properties

### channelId

> **channelId**: `string`

***

### clientRequestId

> **clientRequestId**: `string`

稳定幂等身份，1–128 字符。

***

### paymentType

> **paymentType**: [`ConnectPaymentType`](../type-aliases/ConnectPaymentType.md)

***

### businessKind

> **businessKind**: `string`

App 声明的业务用途；展示时不是可信商业结论。

***

### amountSatoshis

> **amountSatoshis**: `number`

业务金额（聪，不含矿工费）。

***

### feeRateSatoshisPerKb?

> `optional` **feeRateSatoshisPerKb?**: `number`

可选希望费率（sat/kB）。

***

### recipient

> **recipient**: [`ConnectPaymentRecipient`](../type-aliases/ConnectPaymentRecipient.md)
