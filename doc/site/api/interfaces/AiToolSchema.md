[keymaster-connect](../index.md) / AiToolSchema

# Interface: AiToolSchema

Connect v1 公开契约。独立于钱包内部执行 DTO、能力框架和持久化。

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`type`](#type) | `"string"` \| `"number"` \| `"boolean"` \| `"object"` \| `"array"` \| `"integer"` \| `"null"` | Yes | — |
| [`description?`](#description) | `string` | No | — |
| [`properties?`](#properties) | `Record`\<`string`, `AiToolSchema`\> | No | — |
| [`required?`](#required) | `string`[] | No | — |
| [`additionalProperties?`](#additionalproperties) | `boolean` | No | — |
| [`items?`](#items) | `AiToolSchema` | No | — |
| [`enum?`](#enum) | [`JSONValue`](../type-aliases/JSONValue.md)[] | No | — |
| [`minimum?`](#minimum) | `number` | No | — |
| [`maximum?`](#maximum) | `number` | No | — |
| [`minLength?`](#minlength) | `number` | No | — |
| [`maxLength?`](#maxlength) | `number` | No | — |
| [`minItems?`](#minitems) | `number` | No | — |
| [`maxItems?`](#maxitems) | `number` | No | — |

## Properties

### type

> **type**: `"string"` \| `"number"` \| `"boolean"` \| `"object"` \| `"array"` \| `"integer"` \| `"null"`

***

### description?

> `optional` **description?**: `string`

***

### properties?

> `optional` **properties?**: `Record`\<`string`, `AiToolSchema`\>

***

### required?

> `optional` **required?**: `string`[]

***

### additionalProperties?

> `optional` **additionalProperties?**: `boolean`

***

### items?

> `optional` **items?**: `AiToolSchema`

***

### enum?

> `optional` **enum?**: [`JSONValue`](../type-aliases/JSONValue.md)[]

***

### minimum?

> `optional` **minimum?**: `number`

***

### maximum?

> `optional` **maximum?**: `number`

***

### minLength?

> `optional` **minLength?**: `number`

***

### maxLength?

> `optional` **maxLength?**: `number`

***

### minItems?

> `optional` **minItems?**: `number`

***

### maxItems?

> `optional` **maxItems?**: `number`
