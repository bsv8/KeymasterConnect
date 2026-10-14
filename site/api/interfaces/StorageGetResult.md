[@keymaster/connect](../index.md) / StorageGetResult

# Interface: StorageGetResult

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`path`](#path) | `string` | Yes | 文件路径。 |
| [`content`](#content) | [`BinaryField`](BinaryField.md) | Yes | 二进制内容。 |
| [`contentType?`](#contenttype) | `string` | No | MIME 类型。 |
| [`offset`](#offset) | `number` | Yes | 实际起始偏移。 |
| [`totalSize`](#totalsize) | `number` | Yes | 文件总大小（字节）。 |
| [`eof`](#eof) | `boolean` | Yes | 是否已读到文件结尾。 |
| [`revision?`](#revision) | `string` | No | 抽象版本标签。 |
| [`lastModified?`](#lastmodified) | `string` | No | 最后修改时间。 |

## Properties

### path

> **path**: `string`

文件路径。

***

### content

> **content**: [`BinaryField`](BinaryField.md)

二进制内容。

***

### contentType?

> `optional` **contentType?**: `string`

MIME 类型。

***

### offset

> **offset**: `number`

实际起始偏移。

***

### totalSize

> **totalSize**: `number`

文件总大小（字节）。

***

### eof

> **eof**: `boolean`

是否已读到文件结尾。

***

### revision?

> `optional` **revision?**: `string`

抽象版本标签。

***

### lastModified?

> `optional` **lastModified?**: `string`

最后修改时间。
