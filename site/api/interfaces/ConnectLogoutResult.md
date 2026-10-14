[@keymaster/connect](../index.md) / ConnectLogoutResult

# Interface: ConnectLogoutResult

`connect.logout` 成功结果。

设计缘由：返回 ok=true 即表示 session 已被吊销；不需要返回 claims。

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`connectSessionId`](#connectsessionid) | `string` | Yes | — |
| [`revokedAt`](#revokedat) | `number` | Yes | 吊销时间（unix milliseconds）。 |

## Properties

### connectSessionId

> **connectSessionId**: `string`

***

### revokedAt

> **revokedAt**: `number`

吊销时间（unix milliseconds）。
