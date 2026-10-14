[@keymaster/connect](../index.md) / IntentSignResult

# Interface: IntentSignResult

intent.sign 成功结果。

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`signedEnvelope`](#signedenvelope) | [`BinaryField`](BinaryField.md) | Yes | 签名信封最终真值字节（Deterministic CBOR）。 |
| [`signature`](#signature) | [`BinaryField`](BinaryField.md) | Yes | 签名（compact 64-byte secp256k1）。 |

## Properties

### signedEnvelope

> **signedEnvelope**: [`BinaryField`](BinaryField.md)

签名信封最终真值字节（Deterministic CBOR）。

***

### signature

> **signature**: [`BinaryField`](BinaryField.md)

签名（compact 64-byte secp256k1）。
