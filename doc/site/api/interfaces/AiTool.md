[keymaster-connect](../index.md) / AiTool

# Interface: AiTool

Connect v1 公开契约。独立于钱包内部执行 DTO、能力框架和持久化。

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`name`](#name) | `string` | Yes | Stable within this App, 1–40 ASCII letters/digits/underscores, starting with a letter. |
| [`description`](#description) | `string` | Yes | — |
| [`parameters`](#parameters) | [`AiToolSchema`](AiToolSchema.md) | Yes | Explicit supported JSON Schema subset; unsupported keywords are rejected, not ignored. |

## Extends

- [`AiToolDefinition`](AiToolDefinition.md)

## Methods

### execute()

> **execute**(`params`, `context`): [`JSONValue`](../type-aliases/JSONValue.md) \| `Promise`\<[`JSONValue`](../type-aliases/JSONValue.md)\>

#### Parameters

##### params

`Record`\<`string`, [`JSONValue`](../type-aliases/JSONValue.md)\>

##### context

###### signal

`AbortSignal`

#### Returns

[`JSONValue`](../type-aliases/JSONValue.md) \| `Promise`\<[`JSONValue`](../type-aliases/JSONValue.md)\>

## Properties

### name

> **name**: `string`

Stable within this App, 1–40 ASCII letters/digits/underscores, starting with a letter.

#### Inherited from

[`AiToolDefinition`](AiToolDefinition.md).[`name`](AiToolDefinition.md#name)

***

### description

> **description**: `string`

#### Inherited from

[`AiToolDefinition`](AiToolDefinition.md).[`description`](AiToolDefinition.md#description)

***

### parameters

> **parameters**: [`AiToolSchema`](AiToolSchema.md)

Explicit supported JSON Schema subset; unsupported keywords are rejected, not ignored.

#### Inherited from

[`AiToolDefinition`](AiToolDefinition.md).[`parameters`](AiToolDefinition.md#parameters)
