[@keymaster/connect](../index.md) / ConnectLogoutParams

# Interface: ConnectLogoutParams

`connect.logout` 请求参数。

设计缘由：logout 只需要 sessionId；service 在执行时按 event.origin + sessionId
找到对应记录并吊销。

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`connectSessionId`](#connectsessionid) | `string` | Yes | — |

## Properties

### connectSessionId

> **connectSessionId**: `string`
