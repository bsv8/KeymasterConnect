[@keymaster/connect](../index.md) / IdentityGetParams

# Interface: IdentityGetParams

identity.get 请求参数。

设计缘由（施工单 2026-06-28 002 硬切换）：
  - `walletPublicKeyHex` 是**强制**输入字段；所有外部业务方法都属于某个
    `walletPublicKeyHex`（仅 `connect.login` 例外）。缺该字段直接
    `invalid_request` 拒绝。
  - `identity.get` 不再是"推荐登录入口"；登录走 `connect.login`。
    `identity.get` 是"会话内身份断言能力"——`subject` 取自 session 绑
    定 owner，不是当前钱包 active key。

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`aud`](#aud) | `string` | Yes | 目标站点 origin；必须等于 `event.origin`，否则拒绝。 |
| [`iat`](#iat) | `number` | Yes | 签发时间（unix seconds）。 |
| [`exp`](#exp) | `number` | Yes | 过期时间（unix seconds）；必须严格大于 iat。 |
| [`text`](#text) | `string` | Yes | 人类可读确认文案。 |
| [`claims?`](#claims) | `string`[] | No | 请求索要的 claim 名列表。 |
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

### claims?

> `optional` **claims?**: `string`[]

请求索要的 claim 名列表。
- Keymaster 只返回请求里明确列出且当前本地有真值来源的 claim；
- 不存在的 claim 直接省略，不报错。

***

### walletPublicKeyHex

> **walletPublicKeyHex**: `string`

由 `connect.login` 返回的钱包公钥。**必填**。
service 通过公钥与来源 找到绑定 key，不允许 fallback 到 active key。
