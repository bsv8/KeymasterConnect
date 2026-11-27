# Release notes

The public npm version is `0.4.0`; wire remains v1. This release adds challenge-bound login proofs, chain-height subscriptions, batched transaction observation, and resumable MSFile reads with status, range and price controls. App Storage, connection recovery and the public `close()` API remain removed.

After a disconnect or page refresh, apps that open the wallet must log in again. Wallet-launched apps must be reopened from the wallet. The SDK stores no recovery credentials, reconnects nothing automatically, and never replays business requests. On pagehide the client best-effort sends an unload notification bound to the current binding so the wallet can retire the stale runtime connection, then cleans local listeners, timers and waiters without waiting for a reply. Long-term application permissions are managed separately by the wallet. Closing a tab cannot undo signing or broadcasting.
