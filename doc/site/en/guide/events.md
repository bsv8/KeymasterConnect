# Receiving events

```ts
const keymaster = new KeymasterConnectClient({
  targetOrigin: keymasterDeploymentOrigin,
  onEvent(event) {
    if (event.event === "channel.message_received") {
      const { channel, publisherPublicKeyHex, messageId, content } = event.data;
    }
  }
});
```

Events take no request ids; only messages from the configured origin, the current window, the bound wallet identity and the current connection binding are delivered. Delivery stops after transport disconnect; events are a live
feed, not history. Data worth keeping must be persisted by the app itself and the exact subscription set restored after reconnect.
