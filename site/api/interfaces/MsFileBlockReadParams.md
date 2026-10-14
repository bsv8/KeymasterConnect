[@keymaster/connect](../index.md) / MsFileBlockReadParams

# Interface: MsFileBlockReadParams

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`connectSessionId`](#connectsessionid) | `string` | Yes | — |
| [`sourceId`](#sourceid) | `string` | Yes | 要读取的来源路由标识。 |
| [`seedHashHex`](#seedhashhex) | `string` | Yes | Block 所属 Seed；remote wire 不发送该字段。 |
| [`blockHashHex`](#blockhashhex) | `string` | Yes | — |

## Properties

### connectSessionId

> **connectSessionId**: `string`

***

### sourceId

> **sourceId**: `string`

要读取的来源路由标识。

***

### seedHashHex

> **seedHashHex**: `string`

Block 所属 Seed；remote wire 不发送该字段。

***

### blockHashHex

> **blockHashHex**: `string`
