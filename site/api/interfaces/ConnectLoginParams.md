[@keymaster/connect](../index.md) / ConnectLoginParams

# Interface: ConnectLoginParams

`connect.login` 请求参数。

设计缘由（施工单 2026-06-28 001 硬切换 5.1.1）：
  - **不**在 params 里携带 ownerPublicKeyHex：owner 是用户**在 popup
    UI 上**选定的，service 不能代替 caller 决定。
  - caller 发起 `connect.login` 时只需要传 `text` + 可选 `claims`；
    popup 解锁后展示 ready key 列表给用户选；用户点"用此 key 登录"
    后由 UI 调 `service.confirmConnectLogin(recordId, ownerPublicKeyHex, password)`
    写入 service 内部 record。
  - `origin` 仍按 `event.origin` 由 service 在执行时填，params 里
    不允许覆盖。
  - `text` 与 `claims` 与 `identity.get` 语义一致；本次 connect.login
    实际上跑了一次 `identity.get` 取真值快照，存进 session 持久化。

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
