[keymaster-connect](../index.md) / CipherDecryptParams

# Interface: CipherDecryptParams

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`text`](#text) | `string` | Yes | 人类可读确认文案。 |
| [`nonce`](#nonce) | [`BinaryField`](BinaryField.md) | Yes | 加密时保存的 12 字节 nonce。 |
| [`cipherbytes`](#cipherbytes) | [`BinaryField`](BinaryField.md) | Yes | 加密时保存的密文字节。 |

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
