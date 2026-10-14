[@keymaster/connect](../index.md) / CipherEncryptParams

# Interface: CipherEncryptParams

cipher.encrypt 请求参数。

设计缘由（施工单 2026-06-28 001 硬切换）：
  - `walletPublicKeyHex` 是**强制**输入字段；cipher 不再读取钱包全局
    active key，按公钥与实际来源定位绑定 key。
  - 缺 `walletPublicKeyHex` 直接 `invalid_request` 拒绝；不允许 fallback
    到当前 active key。
  - cipher 仍**不**对外暴露签名真值 envelope；返回 nonce + cipherbytes。

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`text`](#text) | `string` | Yes | 人类可读确认文案。 |
| [`contentType`](#contenttype) | `string` | Yes | 调用方自定义的内容类型；与 contentBytes 一起进入密文内层结构。 |
| [`content`](#content) | [`BinaryField`](BinaryField.md) | Yes | 业务字节本体。 |
| [`walletPublicKeyHex`](#walletpublickeyhex) | `string` | Yes | 由 `connect.login` 返回的钱包公钥。 |

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

***

### walletPublicKeyHex

> **walletPublicKeyHex**: `string`

由 `connect.login` 返回的钱包公钥。**必填**；service 通过公钥与来源
找到绑定 key，不允许 fallback 到 active key。
