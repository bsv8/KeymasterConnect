[keymaster-connect](../index.md) / PaymentPayParams

# Interface: PaymentPayParams

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`clientRequestId`](#clientrequestid) | `string` | Yes | 稳定幂等身份，1–128 字符。 |
| [`outputs`](#outputs) | [`PaymentOutput`](PaymentOutput.md)[] | Yes | 业务输出；非空，顺序即链上顺序，找零由钱包追加。 |

## Properties

### clientRequestId

> **clientRequestId**: `string`

稳定幂等身份，1–128 字符。

***

### outputs

> **outputs**: [`PaymentOutput`](PaymentOutput.md)[]

业务输出；非空，顺序即链上顺序，找零由钱包追加。
