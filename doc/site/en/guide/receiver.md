# Wallet receiver integration

`keymaster-connect/server` is the production receiver actually used by wallets, not a test mock server. Client and receiver share the public contract and do not depend on `keymaster.cc` internals.

## Who owns what

The receiver owns message validation, window and origin checks, connection binding, in-flight request correlation, result/event framing, cancellation and ready/closing control frames.

The wallet provides the trusted origin policy, wallet identity and lifecycle generations, and remains responsible for unlock/authorization/UI, signing, funds, storage and durable payment idempotency. Passing protocol validation must never be read as "the user already approved the business". A cryptographically valid proof does not mean the app is catalog-trusted or holds payment authorization either.

## Integration sketch

Structural sketch below; `wallet` is not an SDK default — the host implements it:

```ts
import { KeymasterConnectReceiver } from "keymaster-connect/server";

const receiver = new KeymasterConnectReceiver({
  peer: () => ({ mode: "popup", source: window.opener }),
  lifecycle: () => wallet.lifecycleSnapshot(),
  identity: () => wallet.currentNetworkIdentity(),
});

window.addEventListener("message", async event => {
  if (receiver.acceptReady(event)) return;

  const cancelled = receiver.acceptCancel(event);
  if (cancelled) {
    if (await wallet.cancelIfSafe(cancelled)) {
      receiver.replyError(cancelled, {
        code: "user_rejected", message: "User rejected",
      });
    }
    return;
  }

  const request = await receiver.accept(event);
  if (!request) return;
  try {
    receiver.assertCurrent(request);
    const result = await wallet.authorizeAndExecute(request);
    receiver.replyResult(request, result);
  } catch (error) {
    receiver.replyError(request, wallet.toPublicError(error));
  }
});
```

A real wallet may hold the request context asynchronously, execute after user confirmation, and must not fabricate an equivalent object to stand in for the original context. The receiver uses object identity for request authority. Never return internal owner/session fields as public connection results.

`replyResult` issues a binding for a successful connection result only when the identity matches and the generation is still valid. Hosts should adapt internal business DTOs into public DTOs before handing them to the receiver; the SDK never imports wallet-internal types or services.

## Lifecycle and safety

- popup only accepts the host-specified opener object; appView's exact app origin must come from a trusted launch context. Specify the source as well when a known child window exists.
- `lifecycle()` returns the host's two ground truths, `walletGeneration` and `runGeneration`. They must never be recovered from request parameters or a persisted old SDK binding.
- The receiver checks generations at receive time, execution-authority re-check time, reply time and event-send time; `clear()` invalidates in-progress identity reads and stale requests without revoking durable business responsibility.
- New session windows call `reset()` on a new runtime, `sendReady()` for readiness, `sendClosing()` for close notices. Closing is announced at most once per runtime; clear does not reset that idempotency gate.
- Hosts must still re-check business authority before approval-time signing/writing/broadcasting. The receiver's synchronous checks never replace the final cross-async I/O fence.
- Cancellation is best-effort. `AbortSignal` never proves the remote side did not sign; once a signature or broadcast exists with unknown outcome, keep the original business id and responsibility — never free funds by clearing the SDK pending table.
- Request ids are transport correlation only. Payment `clientRequestId`, immutable applications and the idempotency ledger stay durable in the wallet; never substitute them with transient request ids.
- Duplicate in-flight ids from the same source never execute twice and never get a second error reply truncating the original request; terminal states never cache transaction material in the protocol layer.

## Test boundaries

The same production client and receiver can loop back in a memory environment and across real cross-origin browsers; only wallet business is mocked. Fixed and malicious messages are encoded independently of the client generator, so both sides cannot pass while sharing one bug.

The protocol loopback never proves wallet authorization, approval, real signing, UTXO, durable payment idempotency, broadcast or physical hardware correctness. The wallet must separately verify real business adaptation and integration paths.
