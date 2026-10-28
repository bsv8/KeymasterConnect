[keymaster-connect](../index.md) / KeymasterConnectOptions

# Interface: KeymasterConnectOptions

Configuration for [KeymasterConnectClient](../classes/KeymasterConnectClient.md).

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`targetOrigin`](#targetorigin) | `string` | Yes | Exact Keymaster deployment origin supplied by the host application. |
| [`mode?`](#mode) | [`KeymasterConnectMode`](../type-aliases/KeymasterConnectMode.md) | No | `popup` for direct integrations; `appView` for apps launched by Keymaster. |
| [`popupPath?`](#popuppath) | `string` | No | 完整钱包页面路径，默认根页面；不是独立协议页。 |
| [`popupName?`](#popupname) | `string` | No | Browser window name reused by direct integrations. |
| [`readyTimeoutMs?`](#readytimeoutms) | `number` | No | 等待完整钱包初始化/解锁并发送 ready 的最长时间，默认两分钟；超时不关闭钱包。 |
| [`requestTimeoutMs?`](#requesttimeoutms) | `number` | No | Default request timeout. |
| [`closePollMs?`](#closepollms) | `number` | No | Session Window close detection interval. |
| [`onEvent?`](#onevent) | (`event`) => `void` | No | 接收当前精确订阅频道上的已验签 Channel 事件。 |
| [`onStateChange?`](#onstatechange) | (`state`) => `void` | No | Receives transport lifecycle changes. |
| [`environment?`](#environment) | [`KeymasterBrowserEnvironment`](KeymasterBrowserEnvironment.md) | No | Optional browser adapter, normally only supplied by tests. |

## Properties

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

完整钱包页面路径，默认根页面；不是独立协议页。

***

### popupName?

> `optional` **popupName?**: `string`

Browser window name reused by direct integrations.

***

### readyTimeoutMs?

> `optional` **readyTimeoutMs?**: `number`

等待完整钱包初始化/解锁并发送 ready 的最长时间，默认两分钟；超时不关闭钱包。

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
