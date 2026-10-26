[keymaster-connect](../index.md) / ChannelMessageReceivedEventData

# Interface: ChannelMessageReceivedEventData

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`channel`](#channel) | `string` | Yes | 实际收到的精确频道。 |
| [`publisherPublicKeyHex`](#publisherpublickeyhex) | `string` | Yes | ChannelProtocol 验签得到的作者压缩公钥 hex。 |
| [`messageId`](#messageid) | `string` | Yes | ChannelProtocol 消息编号。 |
| [`content`](#content) | [`JSONValue`](../type-aliases/JSONValue.md) | Yes | 已验签的 App JSON 内容。 |
| [`rawEnvelope?`](#rawenvelope) | `Uint8Array`\<`ArrayBufferLike`\> | No | 入站私密消息的加密信封精确字节（受信任插件用于原样留证）。 |

## Properties

### channel

> **channel**: `string`

实际收到的精确频道。

***

### publisherPublicKeyHex

> **publisherPublicKeyHex**: `string`

ChannelProtocol 验签得到的作者压缩公钥 hex。

***

### messageId

> **messageId**: `string`

ChannelProtocol 消息编号。

***

### content

> **content**: [`JSONValue`](../type-aliases/JSONValue.md)

已验签的 App JSON 内容。

***

### rawEnvelope?

> `optional` **rawEnvelope?**: `Uint8Array`\<`ArrayBufferLike`\>

入站私密消息的加密信封精确字节（受信任插件用于原样留证）。
公共消息或旧 Coordinator 可以省略。
