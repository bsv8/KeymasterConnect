# Release notes

The current public release is `0.1.4`; the tree is at the `0.1.5` optional-encrypted-storage candidate; wire stays v1. Package and wire versions are managed separately; the product is pre-launch, wire stays 1, and deleted-field compatibility branches are not maintained.

## 0.1.5 candidate (wire unchanged at v1)

- Payments move to the outputs model: `payment.pay` is `{ clientRequestId, outputs: [{ amount, script }] }`, in on-chain order, with change appended by the wallet; the `channelId/paymentType/businessKind/amountSatoshis/recipient/feeRate` fields and the `payment.channel.register` / `p2pkh.transfer` public entries and client wrappers are removed.
- Optional encrypted storage: `storage.encrypted.put/get` (`client.storagePutEncrypted/storageGetEncrypted`) take the same plaintext parameters as plain put/get; the wallet vault encrypts before upload and decrypts on read; `0.1.4` receivers reject the new methods. Validate only in isolated candidate packages before release.
- New shared script-explainer library `keymaster-connect/script` (`interpretLockingScript`): full-match explanation of P2PKH/P2PK/standard-multisig/OP_RETURN/unknown scripts, for wallet and CLI Web display only — never decides whether payment is allowed.

## 0.1.4 publicly released (wire v1)

- AI tools: `client.registerTools([...])`, pass `[]` to unregister; re-register after disconnect or binding change; old calls are never replayed. The server side provides `KeymasterAiToolReceiver`.
- Connection modes finalized: app-opened connections open the full wallet home page `/` by default, never a dedicated protocol page; the SDK never closes the wallet window, and `close()`, errors and timeouts only end transport while cancelling the original application best-effort; ready waits cover wallet initialization and unlock, two minutes by default.
- Standalone two-ended stack: client, production receiver, public contract and parameter validation unified under the repo-root `src`; the package offers root, `/protocol`, `/server` and `/script` entries and no longer depends on adjacent wallet sources.

## History

### Full-wallet connection (was a 0.1.2 candidate, superseded by 0.1.4, protocol stays v1)

- App-opened connections open the full wallet home page by default, no dedicated protocol page.
- The SDK never closes the wallet window; close, errors and timeouts only end transport and cancel the original application best-effort.
- Each client opens its own wallet document by default, avoiding opener mix-ups from cross-app named-window reuse; dedicated popup sizing config removed.
- Ready waits cover wallet initialization and unlock, two minutes by default.
- Live business authorization on the receiver side stays with the full wallet; the SDK gains no private keys or internal approval powers.
- 0.1.2 was a candidate, never publicly released, superseded by 0.1.4; candidate-package acceptance never equals public npm release.

## Standalone two-ended stack and single-wallet API (protocol stays v1)

- Client, production receiver, public contract and parameter validation unified under the repo-root `src`; the wallet consumes the same receiver; business authorization and signing never move into the SDK.
- The package offers root, `/protocol` and `/server` (`/script` added in 0.1.5) entries and no longer depends on adjacent wallet sources; doc generation also reads only this repo's sources.
- Public release was 0.1.1 at the time; package and wire versions managed separately; product pre-launch, wire stays 1.
- Initialization only takes the trusted Keymaster `targetOrigin`; the `networkIdentity` option is removed.
- First login, resume and appView launch need no prior public key or network; success results uniformly return them in `networkIdentity`. Apps judge and prompt for themselves.
- Duplicate connection-result `walletPublicKeyHex` / `ownerPublicKeyHex` removed; use `result.networkIdentity.publicKeyHex`.
- All public business parameters' wallet-locating fields removed, along with the `assetId` network switch.
- `resume(params?)` keeps only the necessary app proof and takes no public-key strings; `logout()` takes no public key.
- The SDK automatically uses the receiver's temporary connection binding, continuously verifying message origin, window, binding and identity; apps never store or replay bindings.
- After reset, re-initialization and Worker restart, old bindings die; re-importing the same public key never inherits old runtime authorization.
- `ready` still means transport-available only; `close()` never substitutes for logout.
- No legacy API/protocol compatibility layer. SDK and Keymaster must be acceptance-tested against the release boundary; full-wallet page paths and wire versions are independent.

Migration (at the time): drop legacy constructor options and business public-key/network parameters; read `networkIdentity` after a successful connection instead; resume or log in from a new window before business calls. (The payment channel model changed to outputs in 0.1.5, see above.)
