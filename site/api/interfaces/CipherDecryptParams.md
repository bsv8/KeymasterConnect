[@keymaster/connect](../index.md) / CipherDecryptParams

# Interface: CipherDecryptParams

cipher.decrypt 请求参数。

设计缘由：与 `cipher.encrypt` 对称——`connectSessionId` 是强制输入
字段；不允许 fallback 到 active key。

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`text`](#text) | `string` | Yes | 人类可读确认文案。 |
| [`nonce`](#nonce) | [`BinaryField`](BinaryField.md) | Yes | 加密时保存的 12 字节 nonce。 |
| [`cipherbytes`](#cipherbytes) | [`BinaryField`](BinaryField.md) | Yes | 加密时保存的密文字节。 |
| [`connectSessionId`](#connectsessionid) | `string` | Yes | 由 `connect.login` 返回的 sessionId。 |

## Properties

### text

> **text**: `string`

人类可读确认文案。

***

### nonce

> **nonce**: [`BinaryField`](BinaryField.md)

加密时保存的 12 字节 nonce。

***

### cipherbytes

> **cipherbytes**: [`BinaryField`](BinaryField.md)

加密时保存的密文字节。

***

### connectSessionId

> **connectSessionId**: `string`

由 `connect.login` 返回的 sessionId。**必填**；service 通过此 id
找到绑定 key，不允许 fallback 到 active key。
