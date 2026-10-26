[keymaster-connect](../index.md) / IntentSignParams

# Interface: IntentSignParams

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`aud`](#aud) | `string` | Yes | 目标站点 origin；必须等于 `event.origin`，否则拒绝。 |
| [`iat`](#iat) | `number` | Yes | 签发时间（unix seconds）。 |
| [`exp`](#exp) | `number` | Yes | 过期时间（unix seconds）；必须严格大于 iat。 |
| [`text`](#text) | `string` | Yes | 人类可读确认文案。 |
| [`contentType`](#contenttype) | `string` | Yes | 调用方自定义的内容类型。 |
| [`content`](#content) | [`BinaryField`](BinaryField.md) | Yes | 调用方准备好的最终二进制内容。 |

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

### contentType

> **contentType**: `string`

调用方自定义的内容类型。

***

### content

> **content**: [`BinaryField`](BinaryField.md)

调用方准备好的最终二进制内容。允许为空字节。
