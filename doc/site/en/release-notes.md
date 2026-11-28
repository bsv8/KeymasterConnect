# Release notes

The public npm version is `0.5.0`; wire remains v1. This release adds `msfile.streamseed.follow` and `msfile.streamseed.read`: follow a live or replay track with a stable request ID, then read verified node types, media block lengths and byte ranges with `pending`, `available`, `end` and `stopped` states. Node IDs are decimal strings and one range is limited to 256 KiB.

After a disconnect or page refresh, apps that open the wallet must log in again. Wallet-launched apps must be reopened from the wallet. The SDK stores no recovery credentials, reconnects nothing automatically, and never replays business requests. On pagehide the client best-effort sends an unload notification bound to the current binding so the wallet can retire the stale runtime connection, then cleans local listeners, timers and waiters without waiting for a reply. Long-term application permissions are managed separately by the wallet. Closing a tab cannot undo signing or broadcasting.
