[@keymaster/connect](../index.md) / ConnectLaunchParams

# Interface: ConnectLaunchParams

`connect.launch` 请求参数。

设计缘由（施工单 2026-06-29 001 硬切换）：
  - `connect.launch` 是 `appView` mode 下 client app 的**唯一**首登
    入口；消费 launcher 交给 client app 的 `launchToken`。
  - 不传 aud / iat / exp —— login 时机由 launcher 一次性 bootstrap 阶段
    决定；launch 自身只验 token + 走 sessionRecord 落库；不重新选 key，
    不重新认证。
  - 失败时按 fail-closed：launchToken 缺失 / 已消费 / 当前 Session Window
    不在 `appView` mode / caller origin 与 bootstrap 期记录不一致 → 拒掉；
    不允许 fallback 到 `connect.login`。
  - 成功结果形状与 `connect.login` 对齐，便于 caller 走同一套"持久化
    sessionId + 后续 connect.resume / cipher.*"路径。

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`launchToken`](#launchtoken) | `string` | Yes | 由 launcher 写入 client app 启动 URL 的 launchToken。 |
| [`appIdentity`](#appidentity) | [`AppIdentityProofV1`](AppIdentityProofV1.md) | Yes | 与 launcher 预建 session 绑定的完整签名 proof。 |

## Properties

### launchToken

> **launchToken**: `string`

由 launcher 写入 client app 启动 URL 的 launchToken。一次性消费。

***

### appIdentity

> **appIdentity**: [`AppIdentityProofV1`](AppIdentityProofV1.md)

与 launcher 预建 session 绑定的完整签名 proof。
