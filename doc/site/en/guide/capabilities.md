---
pageClass: capability-map-page
---

# Capability index

All methods are provided by [`KeymasterConnectClient`](/api/classes/KeymasterConnectClient).
First-time connections need no prior public key or network; `login / resume / launch` return `networkIdentity`.
All business calls use the current connection binding, carry no wallet public key or network selector, and cannot bypass business confirmation or verification.

| Method | Purpose |
| --- | --- |
| `connect.login` | Establish a connection after the user confirms the wallet identity |
| `connect.resume` | Resume the current wallet connection and return the live identity; rebuilds a default context on empty cache |
| `connect.logout` | Revoke the current origin's local connection, subscriptions and runtime authorization |
| `connect.launch` | Establish a session with an appView one-time token |
| `identity.get` | Return an identity assertion with expiry, audience and signature |
| `intent.sign` | Sign app-provided bytes under an explicit user intent |
| `cipher.encrypt` / `cipher.decrypt` | Encrypt/decrypt binary content bound to wallet network, Owner and exact origin |
| `payment.pay` / `payment.status` | Pay on the connected wallet network with an outputs array / query payment status |
| `channel.publish` | Publish signed JSON to an exact channel |
| `channel.subscription_set` | Replace the current session's contributed exact subscription set |
| `storage.list` | List directories and objects in the app-isolated namespace |
| `storage.directory.create/delete` | Create or delete directory markers |
| `storage.put/get/delete` | Write, read or delete objects |
| `storage.encrypted.put/get` | Wallet encrypts before upload / returns plaintext after decrypt (`0.1.5` candidate, rejected by `0.1.4` receivers) |
| `msfile.stat` | Query where content lives and supplier quotes |
| `msfile.seed.read` / `msfile.block.read` | Read and verify a Seed or Block |

## Shared call options

Payments submit the outputs array directly (amount plus locking script hex), in on-chain order; the wallet appends change; network comes from the current connection and fees from wallet settings. The old `payment.channel.register` and `p2pkh.transfer` are removed and no longer callable. Payment outputs are explained for display by the standalone `keymaster-connect/script` entry (`interpretLockingScript`) as P2PKH / P2PK / standard multisig / OP_RETURN / unknown, display only — it never decides whether payment is allowed.
Payment authorization and signing policy belong to the wallet; the SDK offers no device connection or software/hardware wallet switching.

```ts
const result = await keymaster.identityGet(params, {
  requestId: crypto.randomUUID(), // this request id
  timeoutMs: 30_000,              // local wait ceiling, ms
  signal: abortController.signal  // cancellation signal
});
```

Exact Params, Results, constants and per-field explanations in Chinese follow the
[API pages](/api/). You may also call the low-level `request(method, params)`; method literals infer the correct types.

## Channel events

`channel.message_received` pushes the verified channel, publisher public key, message id and JSON content.
A successful publish only means Keymaster accepted the local operation, not that any remote party received it.

## Identity requirements

Storage and MSFile require a verified app identity plus the matching requirement. After a local cache reset, re-verify the existing proof in
`resume({ appIdentity })`, see [Sessions](/en/concepts/sessions). Apps cannot specify
suppliers, buckets, physical paths, credentials, private keys or payment amounts.
