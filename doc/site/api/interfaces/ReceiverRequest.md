[keymaster-connect](../index.md) / ReceiverRequest

# Interface: ReceiverRequest\<M\>

只由接收端签发的已验证请求；业务代码不能凭同形对象获得回复/执行权。

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`source`](#source) | [`ConnectPeer`](ConnectPeer.md) | Yes | — |
| [`origin`](#origin) | `string` | Yes | — |
| [`id`](#id) | `string` | Yes | — |
| [`method`](#method) | `M` | Yes | — |
| [`params`](#params) | [`MethodParams`](../type-aliases/MethodParams.md)\<`M`\> | Yes | — |
| [`networkIdentity`](#networkidentity) | [`NetworkIdentity`](NetworkIdentity.md) | Yes | — |
| [`walletGeneration`](#walletgeneration) | `string` | Yes | — |
| [`runGeneration`](#rungeneration) | `string` | Yes | — |
| [`bindingId?`](#bindingid) | `string` | No | — |
| [`signal`](#signal) | `AbortSignal` | Yes | — |

## Type Parameters

### M

`M` *extends* [`ProtocolMethod`](../type-aliases/ProtocolMethod.md) = [`ProtocolMethod`](../type-aliases/ProtocolMethod.md)

## Properties

### source

> `readonly` **source**: [`ConnectPeer`](ConnectPeer.md)

***

### origin

> `readonly` **origin**: `string`

***

### id

> `readonly` **id**: `string`

***

### method

> `readonly` **method**: `M`

***

### params

> `readonly` **params**: [`MethodParams`](../type-aliases/MethodParams.md)\<`M`\>

***

### networkIdentity

> `readonly` **networkIdentity**: [`NetworkIdentity`](NetworkIdentity.md)

***

### walletGeneration

> `readonly` **walletGeneration**: `string`

***

### runGeneration

> `readonly` **runGeneration**: `string`

***

### bindingId?

> `readonly` `optional` **bindingId?**: `string`

***

### signal

> `readonly` **signal**: `AbortSignal`
