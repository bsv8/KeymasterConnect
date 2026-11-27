[keymaster-connect](../index.md) / DomainQueryOptions

# Interface: DomainQueryOptions

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`serviceId?`](#serviceid) | `string` | No | Omit to use the wallet's default service for the current network. |
| [`signal?`](#signal) | `AbortSignal` | No | Aborting sends a best-effort protocol cancel and rejects the local promise. |

## Extends

- `Pick`\<[`KeymasterRequestOptions`](KeymasterRequestOptions.md), `"signal"`\>

## Properties

### serviceId?

> `optional` **serviceId?**: `string`

Omit to use the wallet's default service for the current network.

***

### signal?

> `optional` **signal?**: `AbortSignal`

Aborting sends a best-effort protocol cancel and rejects the local promise.

#### Inherited from

[`KeymasterRequestOptions`](KeymasterRequestOptions.md).[`signal`](KeymasterRequestOptions.md#signal)
