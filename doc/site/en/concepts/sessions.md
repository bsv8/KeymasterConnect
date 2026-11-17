# Connection lifecycle

```ts
const session = await keymaster.login({ text: "Sign in" });
console.log(session.networkIdentity);
// Explicitly revoke this connection when requested by the user:
await keymaster.logout();
```

After a disconnect or page refresh, apps that open the wallet must log in again. Wallet-launched apps must be reopened from the wallet. The SDK stores no recovery credentials, reconnects nothing automatically, and never replays business requests. Close the tab directly; no closing handshake or reply is required. Long-term application permissions are managed separately by the wallet. Closing a tab cannot undo signing or broadcasting.

`login` / `launch` → `networkIdentity: { bsvNetwork, publicKeyHex }`.
`connect()` / `ready` ≠ authorization.

Transport bindings are tied to the actual window, exact origin, wallet generation and worker generation. New connections receive new bindings and must check the returned identity.
