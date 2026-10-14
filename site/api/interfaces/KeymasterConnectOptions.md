[@keymaster/connect](../index.md) / KeymasterConnectOptions

# Interface: KeymasterConnectOptions

Configuration for [KeymasterConnectClient](../classes/KeymasterConnectClient.md).

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`networkIdentity`](#networkidentity) | [`NetworkIdentity`](NetworkIdentity.md) | Yes | 完整身份约束；网络和公钥都不可在会话内漂移。 |
| [`targetOrigin`](#targetorigin) | `string` | Yes | Exact Keymaster deployment origin supplied by the host application. |
| [`mode?`](#mode) | [`KeymasterConnectMode`](../type-aliases/KeymasterConnectMode.md) | No | `popup` for direct integrations; `appView` for apps launched by Keymaster. |
| [`popupPath?`](#popuppath) | `string` | No | Session Window path relative to `targetOrigin`. |
| [`popupName?`](#popupname) | `string` | No | Browser window name reused by direct integrations. |
| [`popupWidth?`](#popupwidth) | `number` | No | — |
| [`popupHeight?`](#popupheight) | `number` | No | — |
| [`readyTimeoutMs?`](#readytimeoutms) | `number` | No | Maximum wait for a popup-mode `ready` message. |
| [`requestTimeoutMs?`](#requesttimeoutms) | `number` | No | Default request timeout. |
| [`closePollMs?`](#closepollms) | `number` | No | Session Window close detection interval. |
| [`onEvent?`](#onevent) | (`event`) => `void` | No | 接收当前精确订阅频道上的已验签 Channel 事件。 |
| [`onStateChange?`](#onstatechange) | (`state`) => `void` | No | Receives transport lifecycle changes. |
| [`environment?`](#environment) | [`KeymasterBrowserEnvironment`](KeymasterBrowserEnvironment.md) | No | Optional browser adapter, normally only supplied by tests. |

## Properties

### networkIdentity

> **networkIdentity**: [`NetworkIdentity`](NetworkIdentity.md)

完整身份约束；网络和公钥都不可在会话内漂移。

***

### targetOrigin

> **targetOrigin**: `string`

Exact Keymaster deployment origin supplied by the host application.

***

### mode?

> `optional` **mode?**: [`KeymasterConnectMode`](../type-aliases/KeymasterConnectMode.md)

`popup` for direct integrations; `appView` for apps launched by Keymaster.

***

### popupPath?

> `optional` **popupPath?**: `string`

Session Window path relative to `targetOrigin`.

***

### popupName?

> `optional` **popupName?**: `string`

Browser window name reused by direct integrations.

***

### popupWidth?

> `optional` **popupWidth?**: `number`

***

### popupHeight?

> `optional` **popupHeight?**: `number`

***

### readyTimeoutMs?

> `optional` **readyTimeoutMs?**: `number`

Maximum wait for a popup-mode `ready` message. Defaults to 30 seconds.

***

### requestTimeoutMs?

> `optional` **requestTimeoutMs?**: `number`

Default request timeout. Defaults to two minutes.

***

### closePollMs?

> `optional` **closePollMs?**: `number`

Session Window close detection interval. Defaults to 500ms.

***

### onEvent?

> `optional` **onEvent?**: (`event`) => `void`

接收当前精确订阅频道上的已验签 Channel 事件。

#### Parameters

##### event

[`ProtocolEventMessage`](../type-aliases/ProtocolEventMessage.md)

#### Returns

`void`

***

### onStateChange?

> `optional` **onStateChange?**: (`state`) => `void`

Receives transport lifecycle changes.

#### Parameters

##### state

[`KeymasterConnectState`](../type-aliases/KeymasterConnectState.md)

#### Returns

`void`

***

### environment?

> `optional` **environment?**: [`KeymasterBrowserEnvironment`](KeymasterBrowserEnvironment.md)

Optional browser adapter, normally only supplied by tests.
