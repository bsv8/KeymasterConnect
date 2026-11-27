[keymaster-connect](../index.md) / MsFileContentReadParams

# Interface: MsFileContentReadParams

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`seedHashHex`](#seedhashhex) | `string` | Yes | — |
| [`clientRequestId?`](#clientrequestid) | `string` | No | — |
| [`maxFullBlockPriceSatoshis?`](#maxfullblockpricesatoshis) | `string` | No | 本次下载任务的完整数据块单价上限，单位聪。 |

## Extends

- [`MsFileStatParams`](MsFileStatParams.md)

## Properties

### seedHashHex

> **seedHashHex**: `string`

#### Inherited from

[`MsFileStatParams`](MsFileStatParams.md).[`seedHashHex`](MsFileStatParams.md#seedhashhex)

***

### clientRequestId?

> `optional` **clientRequestId?**: `string`

***

### maxFullBlockPriceSatoshis?

> `optional` **maxFullBlockPriceSatoshis?**: `string`

本次下载任务的完整数据块单价上限，单位聪。
