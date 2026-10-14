[@keymaster/connect](../index.md) / StoragePutParams

# Interface: StoragePutParams

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`walletPublicKeyHex`](#walletpublickeyhex) | `string` | Yes | 钱包压缩公钥；与消息外层网络身份及实际来源一起定位连接。 |
| [`path`](#path) | `string` | Yes | 文件路径。 |
| [`content`](#content) | [`BinaryField`](BinaryField.md) | Yes | 二进制文件内容。 |
| [`contentType?`](#contenttype) | `string` | No | MIME 类型。 |
| [`overwrite?`](#overwrite) | `boolean` | No | 是否覆盖已有对象。 |

## Properties

### walletPublicKeyHex

> **walletPublicKeyHex**: `string`

钱包压缩公钥；与消息外层网络身份及实际来源一起定位连接。

***

### path

> **path**: `string`

文件路径。

***

### content

> **content**: [`BinaryField`](BinaryField.md)

二进制文件内容。

***

### contentType?

> `optional` **contentType?**: `string`

MIME 类型。

***

### overwrite?

> `optional` **overwrite?**: `boolean`

是否覆盖已有对象。
