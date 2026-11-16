[keymaster-connect](../index.md) / ConnectLaunchParams

# Interface: ConnectLaunchParams

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`launchToken`](#launchtoken) | `string` | Yes | 由 launcher 写入 client app 启动 URL 的 launchToken。 |
| [`publicationProof?`](#publicationproof) | [`PublicationProof`](PublicationProof.md) | No | App 入口的 URL 来源证明（可选；钱包发起的目录启动一般不需要客户端提交， 钱包从所选入口自行读取；应用提交时钱包核对一致性，不能自报来源）。 |

## Properties

### launchToken

> **launchToken**: `string`

由 launcher 写入 client app 启动 URL 的 launchToken。一次性消费。

***

### publicationProof?

> `optional` **publicationProof?**: [`PublicationProof`](PublicationProof.md)

App 入口的 URL 来源证明（可选；钱包发起的目录启动一般不需要客户端提交，
钱包从所选入口自行读取；应用提交时钱包核对一致性，不能自报来源）。
