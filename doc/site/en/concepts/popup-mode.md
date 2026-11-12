# App opens the wallet

`popup` is the default connection direction for independently deployed apps; the name does not mean a dedicated protocol page:

```ts
const keymaster = new KeymasterConnectClient({
  targetOrigin: keymasterDeploymentOrigin,
  mode: "popup"
});
const connected = await keymaster.login({ text: "Sign in to wallet", appIdentity });
```

The full wallet home page `/` opens by default in a normal browser window or tab — no dedicated protocol page, no popup sizing. The browser decides the final window shape. The first call should come from a user click to avoid being blocked.

The wallet finishes creation, import or unlock first, then publishes ready; ready only says transport is available. Login and per-operation approvals all happen in the full wallet's app connection center and global approval panel. The default ready timeout is two minutes; after a timeout, reconnect explicitly — the wallet is never closed.

Each client opens its own wallet document by default, so a reused window from another app can never inherit the wrong opener. The SDK only recognizes the window it actually opened; it cannot find a wallet tab the user opened by hand. The open path comes from the `popupPath` option (default `/`) and must stay inside `targetOrigin`; window names are never shared across apps.

`close()` rejects local pending tasks and cancels the original application best-effort, but never calls `window.close()` and never runs `connect.logout` implicitly. Errors, timeouts, demo unmounts or address switches never close the wallet either. Call `logout()` explicitly to revoke the current connection; closing the wallet is the user's decision.

Candidate-package acceptance never equals public npm release; switch exact dependencies only after the matching version is publicly released.
