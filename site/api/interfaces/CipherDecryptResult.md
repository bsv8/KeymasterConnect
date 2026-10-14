[@keymaster/connect](../index.md) / CipherDecryptResult

# Interface: CipherDecryptResult

cipher.decrypt 成功结果。

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`contentType`](#contenttype) | `string` | Yes | 密文内层结构里的 contentType。 |
| [`content`](#content) | [`BinaryField`](BinaryField.md) | Yes | 还原后的业务字节。 |

## Properties

### contentType

> **contentType**: `string`

密文内层结构里的 contentType。

***

### content

> **content**: [`BinaryField`](BinaryField.md)

还原后的业务字节。
