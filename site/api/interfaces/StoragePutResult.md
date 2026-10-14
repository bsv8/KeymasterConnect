[@keymaster/connect](../index.md) / StoragePutResult

# Interface: StoragePutResult

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`path`](#path) | `string` | Yes | 文件路径。 |
| [`size`](#size) | `number` | Yes | 写入大小（字节）。 |
| [`revision?`](#revision) | `string` | No | 抽象版本标签。 |
| [`updatedAt`](#updatedat) | `number` | Yes | 写入时间戳（毫秒）。 |

## Properties

### path

> **path**: `string`

文件路径。

***

### size

> **size**: `number`

写入大小（字节）。

***

### revision?

> `optional` **revision?**: `string`

抽象版本标签。

***

### updatedAt

> **updatedAt**: `number`

写入时间戳（毫秒）。
