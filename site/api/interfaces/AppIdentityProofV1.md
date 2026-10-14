[@keymaster/connect](../index.md) / AppIdentityProofV1

# Interface: AppIdentityProofV1

外部 caller / catalog 使用的完整签名 proof。

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`version`](#version) | `1` | Yes | — |
| [`publisherPublicKey`](#publisherpublickey) | `string` | Yes | — |
| [`app`](#app) | `object` | Yes | — |
| [`requirements`](#requirements) | [`AppRequirement`](../type-aliases/AppRequirement.md)[] | Yes | — |
| [`signature`](#signature) | `string` | Yes | — |

## Properties

### version

> **version**: `1`

***

### publisherPublicKey

> **publisherPublicKey**: `string`

***

### app

> **app**: `object`

#### id

> **id**: `string`

#### name

> **name**: `string`

#### description

> **description**: `string`

***

### requirements

> **requirements**: [`AppRequirement`](../type-aliases/AppRequirement.md)[]

***

### signature

> **signature**: `string`
