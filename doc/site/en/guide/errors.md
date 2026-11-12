# Errors and cancellation

```ts
import { KeymasterProtocolError, KeymasterTransportError } from "keymaster-connect";

try {
  await keymaster.resume();
} catch (error) {
  if (error instanceof KeymasterProtocolError) console.log(error.code);
  if (error instanceof KeymasterTransportError) console.log(error.code);
}
```

- `KeymasterProtocolError`: Keymaster received the request but rejected it on business or policy grounds. Switch on `code`; never parse the English message. Removed wallet-selector fields get `invalid_request`; apps read the network from the connection result and judge for themselves instead of switching networks per request.
- `connection_expired`: wallet/Worker generation changed or the connection binding died; the SDK clears local identity, the app must explicitly reconnect and judge the returned identity — nothing is silently re-bound.
- `KeymasterTransportError`: popup blocked, window closed, timeout, lost opener, client closed, or `unsupported_protocol` (protocol version mismatch); never means the session was revoked.

Requests accept `AbortSignal`. Cancelling rejects the local promise immediately and sends cancel best-effort; already-executed external effects
cannot be rolled back, and unknown outcomes must be settled by querying business state — never by blind retry.
