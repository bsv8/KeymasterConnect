# Sessions

Apps connect against a Keymaster origin; after user authorization they hold the current wallet's `{ bsvNetwork, publicKeyHex }`. Apps never pick private keys or networks.

| Layer | Lifecycle |
| --- | --- |
| Wallet identity | Public key and the network fixed at creation; the same public key on main/test is a different identity |
| Wallet generation | Changes on reset; re-importing the same key never inherits old runtime authorization |
| Local connection record | Current origin's claims and verified app proof; not a transferable token |
| Transport binding | Issued by the receiver against live origin, window, wallet and Worker generations; used automatically by the SDK |
| Unlock runtime | Locked wallets or restarted workers must re-acquire controlled-operation capability |

## Login and resume

```ts
const session = await keymaster.login({ text: "Sign in to wallet" });
const resumed = await keymaster.resume();
// With Storage / MSFile:
const appSession = await keymaster.resume({ appIdentity });
```

All three establishment paths — `login / resume / launch` — return `networkIdentity` plus claims, and the SDK binds to the returned identity.
Business methods carry no wallet-locating parameters. `connect()` and ready only mean transport is available, never that authorization succeeded.

Resume reads the current wallet and current origin's local record; on an empty cache it only rebuilds the current default context — deleted claims, quotas or runtime handles are never restored. Issuer proofs must be re-verified; unverified extra parameters never gain app privileges.

## Identity changes

After wallet reset, re-initialization or Worker restart, old bindings, queued requests and events must never drift to the new identity.
Re-importing the same private key still drops old runtime authorization. Apps must explicitly re-establish the connection, read the newly returned identity, and judge and prompt for themselves.

Reset never rewrites externally held signed material. Verifiers still check public key, network, signature, scope and the credential's own validity.
Connection results and bare public keys are never payment-free credentials.

## Logout and close

`logout()` revokes the current origin's local connection and related runtime authorization; it takes no wallet public key.
`close()` only closes transport and clears the SDK-local binding; it never logs out. After reopening, `resume()` or log in again before sending business requests.
