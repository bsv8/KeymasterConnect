[keymaster-connect](../index.md) / ProtocolReconnectMessage

# Interface: ProtocolReconnectMessage

暂停恢复控制，不携带钱包选择参数，也不是业务请求重放。

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`v`](#v) | `1` | Yes | — |
| [`type`](#type) | `"reconnect"` | Yes | — |
| [`id`](#id) | `string` | Yes | — |
| [`authorizationId`](#authorizationid) | `string` | Yes | — |
| [`bindingId?`](#bindingid) | `string` | No | — |

## Properties

### v

> **v**: `1`

***

### type

> **type**: `"reconnect"`

***

### id

> **id**: `string`

***

### authorizationId

> **authorizationId**: `string`

***

### bindingId?

> `optional` **bindingId?**: `string`
