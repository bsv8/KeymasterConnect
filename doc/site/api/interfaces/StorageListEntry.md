[keymaster-connect](../index.md) / StorageListEntry

# Interface: StorageListEntry

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`path`](#path) | `string` | Yes | Connect 可见的相对路径。 |
| [`name`](#name) | `string` | Yes | 当前目录下的文件名。 |
| [`size`](#size) | `number` | Yes | 文件大小（字节）。 |
| [`revision?`](#revision) | `string` | No | 抽象版本标签。 |
| [`lastModified?`](#lastmodified) | `string` | No | 最后修改时间。 |

## Properties

### path

> **path**: `string`

Connect 可见的相对路径。

***

### name

> **name**: `string`

当前目录下的文件名。

***

### size

> **size**: `number`

文件大小（字节）。

***

### revision?

> `optional` **revision?**: `string`

抽象版本标签。

***

### lastModified?

> `optional` **lastModified?**: `string`

最后修改时间。
