[@keymaster/connect](../index.md) / StorageListParams

# Interface: StorageListParams

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`walletPublicKeyHex`](#walletpublickeyhex) | `string` | Yes | 钱包压缩公钥；与消息外层网络身份及实际来源一起定位连接。 |
| [`prefix?`](#prefix) | `string` | No | 目录前缀。 |
| [`cursor?`](#cursor) | `string` | No | 分页游标。 |
| [`limit?`](#limit) | `number` | No | 每页数量。 |

## Properties

### walletPublicKeyHex

> **walletPublicKeyHex**: `string`

钱包压缩公钥；与消息外层网络身份及实际来源一起定位连接。

***

### prefix?

> `optional` **prefix?**: `string`

目录前缀。

***

### cursor?

> `optional` **cursor?**: `string`

分页游标。

***

### limit?

> `optional` **limit?**: `number`

每页数量。
