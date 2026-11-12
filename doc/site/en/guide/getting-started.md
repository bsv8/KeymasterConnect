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

## Resume and close

```ts
await keymaster.resume(); // no wallet specified; returns current wallet public key, network and claims
await keymaster.logout(); // revokes the current-origin connection
keymaster.close();        // closes transport only; not a logout
```

Storage / MSFile access submits the issuer-signed proof in `login` or `resume({ appIdentity })`.
A locked wallet may still ask for unlock or confirmation. The app never stores internal connection bindings; after a new window is opened, resume or log in again and re-check the returned identity.

This is a hard cutover: the `networkIdentity` initializer, business `walletPublicKeyHex`, the `assetId` network selector, and the resume/logout public-key parameters are removed; the old protocol is incompatible. See [Release notes](/en/release-notes).
