[@keymaster/connect](../index.md) / StoragePutParams

# Interface: StoragePutParams

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`connectSessionId`](#connectsessionid) | `string` | Yes | Connect 会话 ID。 |
| [`path`](#path) | `string` | Yes | 文件路径。 |
| [`content`](#content) | [`BinaryField`](BinaryField.md) | Yes | 二进制文件内容。 |
| [`contentType?`](#contenttype) | `string` | No | MIME 类型。 |
| [`overwrite?`](#overwrite) | `boolean` | No | 是否覆盖已有对象。 |

## Properties

### connectSessionId

> **connectSessionId**: `string`

Connect 会话 ID。

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
