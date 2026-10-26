[keymaster-connect](../index.md) / ConnectLoginParams

# Interface: ConnectLoginParams

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`text`](#text) | `string` | Yes | 人类可读确认文案。 |
| [`claims?`](#claims) | `string`[] | No | 请求索要的 claim 名列表（与 `identity.get` 同语义）。 |
| [`appIdentity?`](#appidentity) | [`AppIdentityProofV1`](AppIdentityProofV1.md) | No | 发布者签名的 caller identity proof；缺省时建立无 storage 的普通 session。 |

## Properties

### text

> **text**: `string`

人类可读确认文案。

***

### claims?

> `optional` **claims?**: `string`[]

请求索要的 claim 名列表（与 `identity.get` 同语义）。
缺省 = `[]`，不返回任何 claim；通常 caller 想获取 profile.* 时必须显式列出。

***

### appIdentity?

> `optional` **appIdentity?**: [`AppIdentityProofV1`](AppIdentityProofV1.md)

发布者签名的 caller identity proof；缺省时建立无 storage 的普通 session。
