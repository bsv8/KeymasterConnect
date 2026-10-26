[keymaster-connect](../index.md) / ProtocolRequestMessage

# Interface: ProtocolRequestMessage\<M\>

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`v`](#v) | `1` | Yes | — |
| [`type`](#type) | `"request"` | Yes | — |
| [`id`](#id) | `string` | Yes | — |
| [`method`](#method) | `M` | Yes | — |
| [`params`](#params) | [`MethodParams`](../type-aliases/MethodParams.md)\<`M`\> | Yes | — |
| [`bindingId?`](#bindingid) | `string` | No | — |

## Type Parameters

### M

`M` *extends* [`ProtocolMethod`](../type-aliases/ProtocolMethod.md) = [`ProtocolMethod`](../type-aliases/ProtocolMethod.md)

## Properties

### v

> **v**: `1`

***

### type

> **type**: `"request"`

***

### id

> **id**: `string`

***

### method

> **method**: `M`

***

### params

> **params**: [`MethodParams`](../type-aliases/MethodParams.md)\<`M`\>

***

### bindingId?

> `optional` **bindingId?**: `string`
