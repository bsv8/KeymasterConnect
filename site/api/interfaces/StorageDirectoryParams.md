[@keymaster/connect](../index.md) / StorageDirectoryParams

# Interface: StorageDirectoryParams

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`walletPublicKeyHex`](#walletpublickeyhex) | `string` | Yes | 钱包压缩公钥；与消息外层网络身份及实际来源一起定位连接。 |
| [`path`](#path) | `string` | Yes | 目录路径。 |
| [`overwrite?`](#overwrite) | `boolean` | No | 是否允许覆盖已有 marker。 |

## Properties

### walletPublicKeyHex

> **walletPublicKeyHex**: `string`

钱包压缩公钥；与消息外层网络身份及实际来源一起定位连接。

***

### path

> **path**: `string`

目录路径。

***

### overwrite?

> `optional` **overwrite?**: `boolean`

是否允许覆盖已有 marker。
