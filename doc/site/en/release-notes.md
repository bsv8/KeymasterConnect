# Release notes

The public npm version is `0.1.8`; wire remains v1. App Storage, connection recovery and the public `close()` API are removed. Identity, standalone cipher, outputs payments, Channel and MSFile remain.

After a disconnect or page refresh, apps that open the wallet must log in again. Wallet-launched apps must be reopened from the wallet. The SDK stores no recovery credentials, reconnects nothing automatically, and never replays business requests. On pagehide the client best-effort sends an unload notification bound to the current binding so the wallet can retire the stale runtime connection, then cleans local listeners, timers and waiters without waiting for a reply. Long-term application permissions are managed separately by the wallet. Closing a tab cannot undo signing or broadcasting.
