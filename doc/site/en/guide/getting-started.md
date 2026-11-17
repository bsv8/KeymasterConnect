# Getting started

Keymaster is a single-key wallet with its network fixed at initialization. First-time integration needs no prior knowledge of public keys or networks.

```ts
import { KeymasterConnectClient } from "keymaster-connect";

const keymaster = new KeymasterConnectClient({
  targetOrigin: keymasterDeploymentOrigin // configured, exact, trusted Keymaster origin
});
const session = await keymaster.login({ text: "Sign in to the app" });
const { publicKeyHex, bsvNetwork } = session.networkIdentity;
// The app judges and prompts from the returned identity; the SDK offers no key/network switching API.
```

After a successful login, the SDK's read-only `networkIdentity` returns the bound identity; it is `null` before establishment and after close.
Business requests carry no wallet public key or network; the SDK uses the current connection binding.

```ts
await keymaster.identityGet({
  aud: window.location.origin,
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 300,
  text: "Confirm identity",
  claims: []
});
```

## Connection lifecycle

After a disconnect or page refresh, apps that open the wallet must log in again. Wallet-launched apps must be reopened from the wallet. The SDK stores no recovery credentials, reconnects nothing automatically, and never replays business requests. Close the tab directly; no closing handshake or reply is required. Long-term application permissions are managed separately by the wallet. Closing a tab cannot undo signing or broadcasting.

```ts
await keymaster.logout();
```
