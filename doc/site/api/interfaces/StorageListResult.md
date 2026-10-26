[keymaster-connect](../index.md) / StorageListResult

# Interface: StorageListResult

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`prefix`](#prefix) | `string` | Yes | 当前目录前缀。 |
| [`parentPrefix`](#parentprefix) | `string` | Yes | 父目录前缀。 |
| [`directories`](#directories) | `object`[] | Yes | 虚拟目录列表。 |
| [`files`](#files) | [`StorageListEntry`](StorageListEntry.md)[] | Yes | 当前页文件。 |
| [`markerPath?`](#markerpath) | `string` | No | 目录 marker 路径。 |
| [`nextCursor?`](#nextcursor) | `string` | No | 下一页游标。 |

## Properties

### prefix

> **prefix**: `string`

当前目录前缀。

***

### parentPrefix

> **parentPrefix**: `string`

父目录前缀。

***

### directories

> **directories**: `object`[]

虚拟目录列表。

#### path

> **path**: `string`

#### name

> **name**: `string`

***

### files

> **files**: [`StorageListEntry`](StorageListEntry.md)[]

当前页文件。

***

### markerPath?

> `optional` **markerPath?**: `string`

目录 marker 路径。

***

### nextCursor?

> `optional` **nextCursor?**: `string`

下一页游标。
