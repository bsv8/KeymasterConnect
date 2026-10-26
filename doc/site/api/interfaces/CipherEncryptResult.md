[keymaster-connect](../index.md) / CipherEncryptResult

# Interface: CipherEncryptResult

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`nonce`](#nonce) | [`BinaryField`](BinaryField.md) | Yes | 本次加密随机生成的 12 字节 nonce。 |
| [`cipherbytes`](#cipherbytes) | [`BinaryField`](BinaryField.md) | Yes | AES-GCM 密文字节（含认证 tag）。 |

## Properties

### nonce

> **nonce**: [`BinaryField`](BinaryField.md)

本次加密随机生成的 12 字节 nonce。

***

### cipherbytes

> **cipherbytes**: [`BinaryField`](BinaryField.md)

AES-GCM 密文字节（含认证 tag）。
