[@keymaster/connect](../index.md) / StorageGetParams

# Interface: StorageGetParams

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`walletPublicKeyHex`](#walletpublickeyhex) | `string` | Yes | 钱包压缩公钥；与消息外层网络身份及实际来源一起定位连接。 |
| [`path`](#path) | `string` | Yes | 文件路径。 |
| [`offset?`](#offset) | `number` | No | 起始偏移（字节）。 |
| [`length?`](#length) | `number` | No | 读取长度（字节）。 |
| [`ifMatch?`](#ifmatch) | `string` | No | 期望的抽象版本标签。 |

## Properties

### walletPublicKeyHex

> **walletPublicKeyHex**: `string`

钱包压缩公钥；与消息外层网络身份及实际来源一起定位连接。

***

### path

> **path**: `string`

文件路径。

***

### offset?

> `optional` **offset?**: `number`

起始偏移（字节）。

***

### length?

> `optional` **length?**: `number`

读取长度（字节）。

***

### ifMatch?

> `optional` **ifMatch?**: `string`

期望的抽象版本标签。
