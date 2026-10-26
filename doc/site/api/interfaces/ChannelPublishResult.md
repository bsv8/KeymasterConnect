[keymaster-connect](../index.md) / ChannelPublishResult

# Interface: ChannelPublishResult

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`messageId`](#messageid) | `string` | Yes | 由 Keymaster/ChannelProtocol 生成的消息编号。 |
| [`signedMessage?`](#signedmessage) | `Uint8Array`\<`ArrayBufferLike`\> | No | 出站签名明文的精确字节（已签名、未加密）；只有私密发布返回。 |

## Properties

### messageId

> **messageId**: `string`

由 Keymaster/ChannelProtocol 生成的消息编号。

***

### signedMessage?

> `optional` **signedMessage?**: `Uint8Array`\<`ArrayBufferLike`\>

出站签名明文的精确字节（已签名、未加密）；只有私密发布返回。
调用方可把它作为出站证据原样保存，不需要也不允许重新签名。
