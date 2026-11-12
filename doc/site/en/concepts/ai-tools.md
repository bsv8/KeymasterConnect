# Registering app tools with wallet AI

The SDK provides this since **0.1.4**; wire stays v1. Consumers should confirm the version is published on the npm registry before upgrading. Shipping the SDK says nothing about end-to-end model acceptance.

## Register and call

Apps first complete a normal connection, then replace this connection's tool set with `registerTools()`. Registration needs no extra approval; the wallet user can still disable tools. An empty array unregisters everything.

```ts
import { KeymasterConnectClient, type AiTool } from "keymaster-connect";

const client = new KeymasterConnectClient({ targetOrigin: "https://keymaster.cc" });
await client.login({ text: "Sign in to app" });

const tools: AiTool[] = [{
  name: "summarize_selection",
  description: "Return a summary of the user's selection in this app; never modify data.",
  parameters: {
    type: "object",
    properties: { label: { type: "string", maxLength: 100 } },
    required: ["label"],
    additionalProperties: false,
  },
  async execute(params, { signal }) {
    signal.throwIfAborted();
    return { label: params.label, summary: "Summary provided by the app" };
  },
}];

const registered = await client.registerTools(tools);
// registered.names are wallet-derived global tool names; locally still addressed as summarize_selection.

// To change tools: pass the complete new set again; not an incremental add.
// To unregister:
await client.registerTools([]);
```

When wallet AI calls a tool, the SDK runs the app callback. Parameters and results are JSON only; functions, undefined, BigInt, cyclic objects and binary buffers are rejected. The SDK never hands supplier keys, full chats or wallet private keys to the app.

Callback failures return only a generic failure, never stack traces or exception text that could leak secrets. To express a business failure to the AI, return an explicit JSON business result.

## Identity, connection and cancellation

- Tools live in an application-identity namespace. When another live connection of the same app already holds tools, a new connection's registration fails; calls are never silently routed to a different connection.
- Tools are callable only while their own connection is valid. Pause, disconnect, lock, logout or binding replacement drop tools and in-flight waits. Re-register explicitly after reconnect — the SDK never revives business callbacks or replays calls.
- `close()` best-effort notifies the wallet to unregister tools, but never closes the wallet window and never revokes the durable Connect authorization. On message loss, delivery is not guaranteed; the wallet's own window and lifecycle checks still revoke rights.
- Registration is not a payment, signing or other Connect business grant. When an app callback starts its own Connect business, the corresponding external authorization still applies.
- Wallet cancellation or timeout arrives on `AbortSignal`; apps should propagate the signal and stop cancellable work. Side effects that already happened cannot be rolled back; unknown results must never be auto-retried.
- A non-empty tool set cannot be replaced while a callback is executing; passing an empty array unregisters and cancels waits. A single call defaults to a two-minute timeout.
- Registration timeout or cancellation means the result is unknown; the client clears the executable callbacks — re-register explicitly instead of assuming the wallet rolled back.

## Parameter schema scope

This is an explicit JSON Schema subset; unsupported keywords are rejected outright — never pretend to implement full JSON Schema:

- `type`: object, array, string, number, integer, boolean, null.
- `description`, `enum`.
- Objects: `properties`, `required`, boolean `additionalProperties`.
- Arrays: `items`, `minItems`, `maxItems`.
- Strings: `minLength`, `maxLength` (Unicode code points).
- Numbers: `minimum`, `maximum`; integer is limited to JavaScript safe integers.

Root parameters must be objects, arrays must declare items. `$ref`, combinators, pattern, format and union types are not supported. Tool names are 1–40 ASCII letters/digits/underscores starting with a letter; at most 64 tools per connection. JSON is at most 32 levels deep, schemas at most 16 levels, one tool message at most ~1 MB (in JSON characters).

## Wallet host

`keymaster-connect/server` provides `KeymasterAiToolReceiver`. The host's `isCurrent(bindingId)` must check the real message source, the exact origin, the same production receiver's valid binding and the wallet lifecycle together. Comparing self-reported strings alone never authorizes.

The host owns app identity, tool namespaces and connection conflicts; the tool receiver owns registration frames, reverse calls, result correlation, timeouts and cancellation. It never receives app source code and never takes over wallet funds or durable authorization.

Single-file AI results use a separate MessageChannel narrow bridge for iframes, not this app tool channel, and cannot reach wallet permissions through this SDK.
