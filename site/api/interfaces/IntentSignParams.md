[@keymaster/connect](../index.md) / IntentSignParams

# Interface: IntentSignParams

intent.sign 请求参数。

设计缘由（施工单 2026-06-28 002 硬切换）：
  - `walletPublicKeyHex` 是**强制**输入字段；签名主体公钥取自 session
    绑定的 owner，不再读取钱包全局 active key。
  - 旧叙事"登录场景推荐 identity.get"已废弃；登录走 `connect.login`。

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`aud`](#aud) | `string` | Yes | 目标站点 origin；必须等于 `event.origin`，否则拒绝。 |
| [`iat`](#iat) | `number` | Yes | 签发时间（unix seconds）。 |
| [`exp`](#exp) | `number` | Yes | 过期时间（unix seconds）；必须严格大于 iat。 |
| [`text`](#text) | `string` | Yes | 人类可读确认文案。 |
| [`contentType`](#contenttype) | `string` | Yes | 调用方自定义的内容类型。 |
| [`content`](#content) | [`BinaryField`](BinaryField.md) | Yes | 调用方准备好的最终二进制内容。 |
| [`walletPublicKeyHex`](#walletpublickeyhex) | `string` | Yes | 由 `connect.login` 返回的钱包公钥。 |

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

***

### walletPublicKeyHex

> **walletPublicKeyHex**: `string`

由 `connect.login` 返回的钱包公钥。**必填**。
service 通过公钥与来源 找到绑定 key，不允许 fallback 到 active key。
