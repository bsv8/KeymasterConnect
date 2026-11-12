# Security model

- Origin: every message must come from both the configured exact origin and the current session window.
- Wallet identity: network plus public key jointly identify; same public key on main/test records are isolated and never fall back to a default network.
- Locating vs. authorizing: bare public keys locate; execution still re-checks the current identity, the live origin, confirmation and signatures. Old runtime handles are never revived by re-importing the same key.
- App identity: Storage and MSFile require the issuer-signed proof; recovery re-verifies the existing proof — appending unsigned parameters never upgrades identity.
- User confirmation: payment copy and authorization policy are controlled by Keymaster; apps cannot disguise payments as ordinary operations.
- Private keys: the SDK only ever sees public identities, signatures, ciphertext, messages and results — never private keys or reusable shared secrets.

External credentials are verified by the verifier against identity, signature, scope and their own validity. Local reset or logout never rewrites already-issued material; nor does it restore old local settings.
