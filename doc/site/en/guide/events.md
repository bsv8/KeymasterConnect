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

## Block height

`chain.subscribeHeight(handler)` returns an unsubscribe function. The browser wallet sends the current tip after connecting and pushes changes to either height or hash. The handler receives `{ height, blockHash }`. A late listener receives the cached tip immediately. The wire event is `chain.height_changed`.

`chain.getHeight()` reads the wallet's cached `{ height, blockHash }`. Before the first successful sync, the read returns `internal_error` and subscribers wait for the first push. The wallet controls how often it queries the node.
