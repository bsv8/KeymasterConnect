[@keymaster/connect](../index.md) / ConnectResumeParams

# Interface: ConnectResumeParams

`connect.resume` 请求参数。

设计缘由：resume 必须显式传入 sessionId；service 在执行时按
`event.origin` + sessionId 查 session 记录。sessionId 不在 params
里时直接 invalid_request。

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`connectSessionId`](#connectsessionid) | `string` | Yes | 由 `connect.login` 返回的 sessionId。 |

## Properties

### connectSessionId

> **connectSessionId**: `string`

由 `connect.login` 返回的 sessionId。
caller 持 sessionId，popup 持有 session 真值与 unlock runtime。
