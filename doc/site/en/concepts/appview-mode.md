# appView mode

When Keymaster launches the app itself, the app consumes the one-time token and talks to the host wallet's `window.opener` — no intermediate session window.
Initialization takes no wallet identity. A successful `launch` returns the current wallet public key and network; the app judges and prompts for itself; the app publisher key is not the wallet key.

```ts
const keymaster = new KeymasterConnectClient({
  targetOrigin: sessionWindowOrigin, // host wallet exact origin injected by the launch URL
  mode: "appView"
});

await keymaster.connect();
const session = await keymaster.launch({ launchToken, appIdentity });
```

The SDK reuses the existing opener and sends ready after the listener is installed. A missing or lost opener fails safely and never falls back to
`window.open()`. `connect.launch` cannot be used in popup mode, and invalid tokens never degrade into a login.
