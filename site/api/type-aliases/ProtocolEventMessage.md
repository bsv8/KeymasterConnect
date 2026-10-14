[@keymaster/connect](../index.md) / ProtocolEventMessage

# Type Alias: ProtocolEventMessage

> **ProtocolEventMessage** = \{ `v`: *typeof* [`PROTOCOL_VERSION`](../variables/PROTOCOL_VERSION.md); `type`: `"event"`; `event`: `"channel.message_received"`; `data`: [`ChannelMessageReceivedEventData`](../interfaces/ChannelMessageReceivedEventData.md); \} \| \{ `v`: *typeof* [`PROTOCOL_VERSION`](../variables/PROTOCOL_VERSION.md); `type`: `"event"`; `event`: `"price.changed"`; `data`: [`PriceChangedEventData`](PriceChangedEventData.md); \}

顶层 `event` 报文（server-pushed）。

事件是单向推送，不回 result。

## Union Members

### Type Literal

\{ `v`: *typeof* [`PROTOCOL_VERSION`](../variables/PROTOCOL_VERSION.md); `type`: `"event"`; `event`: `"channel.message_received"`; `data`: [`ChannelMessageReceivedEventData`](../interfaces/ChannelMessageReceivedEventData.md); \}

#### v

> **v**: *typeof* [`PROTOCOL_VERSION`](../variables/PROTOCOL_VERSION.md)

#### type

> **type**: `"event"`

#### event

> **event**: `"channel.message_received"`

#### data

> **data**: [`ChannelMessageReceivedEventData`](../interfaces/ChannelMessageReceivedEventData.md)

已验签的 Channel 事件数据。

***

### Type Literal

\{ `v`: *typeof* [`PROTOCOL_VERSION`](../variables/PROTOCOL_VERSION.md); `type`: `"event"`; `event`: `"price.changed"`; `data`: [`PriceChangedEventData`](PriceChangedEventData.md); \}

#### v

> **v**: *typeof* [`PROTOCOL_VERSION`](../variables/PROTOCOL_VERSION.md)

#### type

> **type**: `"event"`

#### event

> **event**: `"price.changed"`

#### data

> **data**: [`PriceChangedEventData`](PriceChangedEventData.md)

当前展示价格（金额 + 单位）；未就绪时为 amount "0"。
