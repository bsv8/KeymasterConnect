[keymaster-connect](../index.md) / PaymentPrepareParams

# Interface: PaymentPrepareParams

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`clientRequestId`](#clientrequestid) | `string` | Yes | — |
| [`outputs`](#outputs) | [`PaymentOutput`](PaymentOutput.md)[] | Yes | — |
| [`dataSignature`](#datasignature) | [`PaymentDataSignature`](PaymentDataSignature.md) | Yes | — |

## Extends

- [`PaymentStatusParams`](PaymentStatusParams.md)

## Properties

### clientRequestId

> **clientRequestId**: `string`

#### Inherited from

[`PaymentStatusParams`](PaymentStatusParams.md).[`clientRequestId`](PaymentStatusParams.md#clientrequestid)

***

### outputs

> **outputs**: [`PaymentOutput`](PaymentOutput.md)[]

***

### dataSignature

> **dataSignature**: [`PaymentDataSignature`](PaymentDataSignature.md)
