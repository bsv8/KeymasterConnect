[keymaster-connect](../index.md) / ConnectLoginParams

# Interface: ConnectLoginParams

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`text`](#text) | `string` | Yes | 人类可读确认文案。 |
| [`claims?`](#claims) | `string`[] | No | 请求索要的 claim 名列表（与 `identity.get` 同语义）。 |
| [`publicationProof?`](#publicationproof) | [`PublicationProof`](PublicationProof.md) | No | App 入口的 URL 来源证明（SDK 从当前入口 HTML 头读取并提交）。 |

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

### publicationProof?

> `optional` **publicationProof?**: [`PublicationProof`](PublicationProof.md)

App 入口的 URL 来源证明（SDK 从当前入口 HTML 头读取并提交）。
钱包验签并核对证明 origin 与可信 event.origin 是否一致；应用不能自报来源。
本地 Files 部署不依赖该字段（以 daemon 可信部署登记为准）。
