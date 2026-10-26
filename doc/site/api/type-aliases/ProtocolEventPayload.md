[keymaster-connect](../index.md) / ProtocolEventPayload

# Type Alias: ProtocolEventPayload

> **ProtocolEventPayload** = \{ `v`: *typeof* [`PROTOCOL_VERSION`](../variables/PROTOCOL_VERSION.md); `type`: `"event"`; `event`: `"channel.message_received"`; `data`: [`ChannelMessageReceivedEventData`](../interfaces/ChannelMessageReceivedEventData.md); \} \| \{ `v`: *typeof* [`PROTOCOL_VERSION`](../variables/PROTOCOL_VERSION.md); `type`: `"event"`; `event`: `"price.changed"`; `data`: [`PriceChangedEventData`](PriceChangedEventData.md); \}
