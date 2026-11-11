[keymaster-connect](../index.md) / AiToolDefinition

# Interface: AiToolDefinition

Connect v1 公开契约。独立于钱包内部执行 DTO、能力框架和持久化。

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`name`](#name) | `string` | Yes | Stable within this App, 1–40 ASCII letters/digits/underscores, starting with a letter. |
| [`description`](#description) | `string` | Yes | — |
| [`parameters`](#parameters) | [`AiToolSchema`](AiToolSchema.md) | Yes | Explicit supported JSON Schema subset; unsupported keywords are rejected, not ignored. |

## Extended by

- [`AiTool`](AiTool.md)

## Properties

### name

> **name**: `string`

Stable within this App, 1–40 ASCII letters/digits/underscores, starting with a letter.

***

### description

> **description**: `string`

***

### parameters

> **parameters**: [`AiToolSchema`](AiToolSchema.md)

Explicit supported JSON Schema subset; unsupported keywords are rejected, not ignored.
