[keymaster-connect](../index.md) / IdentityGetParams

# Interface: IdentityGetParams

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`aud`](#aud) | `string` | Yes | 目标站点 origin；必须等于 `event.origin`，否则拒绝。 |
| [`iat`](#iat) | `number` | Yes | 签发时间（unix seconds）。 |
| [`exp`](#exp) | `number` | Yes | 过期时间（unix seconds）；必须严格大于 iat。 |
| [`text`](#text) | `string` | Yes | 人类可读确认文案。 |
| [`claims?`](#claims) | `string`[] | No | 请求索要的 claim 名列表。 |

## Properties

### aud

> **aud**: `string`

目标站点 origin；必须等于 `event.origin`，否则拒绝。

***

### iat

> **iat**: `number`

签发时间（unix seconds）。

***

### exp

> **exp**: `number`

过期时间（unix seconds）；必须严格大于 iat。

***

### text

> **text**: `string`

人类可读确认文案。

***

### claims?

> `optional` **claims?**: `string`[]

请求索要的 claim 名列表。
- Keymaster 只返回请求里明确列出且当前本地有真值来源的 claim；
- 不存在的 claim 直接省略，不报错。
