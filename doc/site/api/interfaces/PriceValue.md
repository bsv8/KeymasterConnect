[keymaster-connect](../index.md) / PriceValue

# Interface: PriceValue

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`amount`](#amount) | `string` | Yes | 十进制金额字符串，例如 "45.12"；未就绪时为 "0"。 |
| [`unit`](#unit) | `string` | Yes | 计价单位，例如 "USDT"；未就绪时仍给出当前配置推导出的单位。 |
| [`updatedAtMs`](#updatedatms) | `number` | Yes | 行情快照生成的 Unix 毫秒时间；未就绪时为 0。 |

## Properties

### amount

> **amount**: `string`

十进制金额字符串，例如 "45.12"；未就绪时为 "0"。

***

### unit

> **unit**: `string`

计价单位，例如 "USDT"；未就绪时仍给出当前配置推导出的单位。

***

### updatedAtMs

> **updatedAtMs**: `number`

行情快照生成的 Unix 毫秒时间；未就绪时为 0。
