[keymaster-connect](../index.md) / IdentityGetResult

# Interface: IdentityGetResult

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`identityEnvelope`](#identityenvelope) | [`BinaryField`](BinaryField.md) | Yes | Identity 信封最终真值字节（Deterministic CBOR）。 |
| [`signature`](#signature) | [`BinaryField`](BinaryField.md) | Yes | 签名（compact 64-byte secp256k1）。 |
| [`subject`](#subject) | `object` | Yes | 签名主体公钥（33-byte compressed）。 |
| [`resolvedClaims`](#resolvedclaims) | `Record`\<`string`, [`ResolvedClaimValue`](../type-aliases/ResolvedClaimValue.md)\> | Yes | Keymaster 本次实际返回给调用方的 claim 真值。 |

## Properties

### identityEnvelope

> **identityEnvelope**: [`BinaryField`](BinaryField.md)

Identity 信封最终真值字节（Deterministic CBOR）。

***

### signature

> **signature**: [`BinaryField`](BinaryField.md)

签名（compact 64-byte secp256k1）。

***

### subject

> **subject**: `object`

签名主体公钥（33-byte compressed）。

#### publicKey

> **publicKey**: [`BinaryField`](BinaryField.md)

***

### resolvedClaims

> **resolvedClaims**: `Record`\<`string`, [`ResolvedClaimValue`](../type-aliases/ResolvedClaimValue.md)\>

Keymaster 本次实际返回给调用方的 claim 真值。
