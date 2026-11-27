[keymaster-connect](../index.md) / ConnectLoginParams

# Interface: ConnectLoginParams

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`loginChallenge?`](#loginchallenge) | `string` | No | One-time challenge issued by the application backend (32 bytes, lowercase hex). |
| [`text`](#text) | `string` | Yes | 人类可读确认文案。 |
| [`claims?`](#claims) | `string`[] | No | 请求索要的 claim 名列表（与 `identity.get` 同语义）。 |
| [`publicationProof?`](#publicationproof) | `string` | No | App 入口的发布来源证明记录字符串（`base64url(规范JSON).签名hex`）。 |

## Properties

### loginChallenge?

> `optional` **loginChallenge?**: `string`

One-time challenge issued by the application backend (32 bytes, lowercase hex).

***

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

> `optional` **publicationProof?**: `string`

App 入口的发布来源证明记录字符串（`base64url(规范JSON).签名hex`）。
SDK 从当前入口 HTML 头读取并整体提交，不解码、不校验内容；
钱包解码、验签并核对证明 origin 与可信 event.origin，应用不能自报来源。
本地 Files 部署不依赖该字段（以 daemon 可信部署登记为准）。
