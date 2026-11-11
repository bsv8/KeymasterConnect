[keymaster-connect](../index.md) / PaymentOutput

# Interface: PaymentOutput

Connect v1 输出支付：业务输出数组，顺序即链上顺序。

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`amount`](#amount) | `number` | Yes | 聪，允许 0（数据输出）。 |
| [`script`](#script) | `string` | Yes | locking script hex；偶数长度 hex，允许空字符串（零长度锁定脚本）。 |

## Properties

### amount

> **amount**: `number`

聪，允许 0（数据输出）。必须为非负安全整数。

***

### script

> **script**: `string`

locking script hex；偶数长度 hex，允许空字符串（零长度锁定脚本）。
