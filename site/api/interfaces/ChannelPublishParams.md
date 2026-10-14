[@keymaster/connect](../index.md) / ChannelPublishParams

# Interface: ChannelPublishParams

Connect App 的 Channel 发布入参。

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`channel`](#channel) | `string` | Yes | 要发布到的 SSP 精确频道；不允许通配符。 |
| [`content`](#content) | [`JSONValue`](../type-aliases/JSONValue.md) | Yes | App 自己定义的 JSON 内容；协议标识也应放在这里。 |

## Properties

### channel

> **channel**: `string`

要发布到的 SSP 精确频道；不允许通配符。

***

### content

> **content**: [`JSONValue`](../type-aliases/JSONValue.md)

App 自己定义的 JSON 内容；协议标识也应放在这里。
