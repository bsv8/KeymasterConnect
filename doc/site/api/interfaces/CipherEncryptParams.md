[keymaster-connect](../index.md) / CipherEncryptParams

# Interface: CipherEncryptParams

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`text`](#text) | `string` | Yes | 人类可读确认文案。 |
| [`contentType`](#contenttype) | `string` | Yes | 调用方自定义的内容类型；与 contentBytes 一起进入密文内层结构。 |
| [`content`](#content) | [`BinaryField`](BinaryField.md) | Yes | 业务字节本体。 |

## Properties

### text

> **text**: `string`

人类可读确认文案。

***

### contentType

> **contentType**: `string`

调用方自定义的内容类型；与 contentBytes 一起进入密文内层结构。

***

### content

> **content**: [`BinaryField`](BinaryField.md)

业务字节本体。
