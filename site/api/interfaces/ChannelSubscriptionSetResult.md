[@keymaster/connect](../index.md) / ChannelSubscriptionSetResult

# Interface: ChannelSubscriptionSetResult

Channel 订阅替换结果。

## Properties overview

| Property | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| [`channels`](#channels) | `string`[] | Yes | Coordinator 已接受的当前 caller 逻辑期望集合；不代表 Supplier 物理订阅已完成。 |
| [`statuses?`](#statuses) | `ChannelSubscriptionStatus`[] | No | Coordinator/Mux 返回的当前物理状态快照。 |

## Properties

### channels

> **channels**: `string`[]

Coordinator 已接受的当前 caller 逻辑期望集合；不代表 Supplier 物理订阅已完成。

***

### statuses?

> `optional` **statuses?**: `ChannelSubscriptionStatus`[]

Coordinator/Mux 返回的当前物理状态快照。
旧 runtime 可以省略该字段；当前 Coordinator 会为每个 accepted
channel 返回一份权威快照，使新 caller 不必等待下一次状态事件。
