[keymaster-connect](../index.md) / ProtocolCancelMessage

# Interface: ProtocolCancelMessage

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`bindingId?`](#bindingid) | `string` | No | Present for cancellation of an already-bound business request. |
| [`v`](#v) | `1` | Yes | — |
| [`type`](#type) | `"cancel"` | Yes | — |
| [`id`](#id) | `string` | Yes | 要取消的原 `request.id`。 |

## Properties

### bindingId?

> `optional` **bindingId?**: `string`

Present for cancellation of an already-bound business request.

***

### v

> **v**: `1`

***

### type

> **type**: `"cancel"`

***

### id

> **id**: `string`

要取消的原 `request.id`。
