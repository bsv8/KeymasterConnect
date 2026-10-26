[keymaster-connect](../index.md) / KeymasterRequestOptions

# Interface: KeymasterRequestOptions

Options applying to one protocol request.

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`requestId?`](#requestid) | `string` | No | Caller-controlled correlation id. |
| [`timeoutMs?`](#timeoutms) | `number` | No | Per-request timeout in milliseconds. |
| [`signal?`](#signal) | `AbortSignal` | No | Aborting sends a best-effort protocol cancel and rejects the local promise. |

## Properties

### requestId?

> `optional` **requestId?**: `string`

Caller-controlled correlation id. A UUID is generated when omitted.

***

### timeoutMs?

> `optional` **timeoutMs?**: `number`

Per-request timeout in milliseconds.

***

### signal?

> `optional` **signal?**: `AbortSignal`

Aborting sends a best-effort protocol cancel and rejects the local promise.
