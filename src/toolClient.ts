import { assertToolPayload, isAiToolMessage, parseToolDefinitions, validateToolArguments, type AiTool, type AiToolMessage, type AiToolsRegistered } from "./tools.js";
import type { JSONValue } from "./protocol.js";

/** Owned by one Client transport. No callback survives a lost connection. */
export class AiToolClient {
  private callbacks = new Map<string, AiTool>();
  private pending?: { id: string; tools: Map<string, AiTool>; resolve(result: AiToolsRegistered): void; reject(error: unknown): void; timer: ReturnType<typeof setTimeout>; off(): void };
  private running = new Map<string, AbortController>();
  private seen = new Set<string>();
  constructor(private current: () => string | null, private send: (message: AiToolMessage) => void, private uuid: () => string) {}
  register(tools: AiTool[], options: { signal?: AbortSignal; timeoutMs?: number } = {}): Promise<AiToolsRegistered> {
    const bindingId = this.current();
    if (!bindingId) return Promise.reject(new Error("Connect before registering AI tools"));
    if (this.pending) return Promise.reject(new Error("Tool registration is already pending"));
    if (tools.length && this.running.size) return Promise.reject(new Error("Cannot replace tools while callbacks are running"));
    const definitions = parseToolDefinitions(tools.map(({ name, description, parameters }) => ({ name, description, parameters })));
    if (tools.some(tool => typeof tool.execute !== "function")) throw new TypeError("Tool execute must be a function");
    if (options.signal?.aborted) return Promise.reject(options.signal.reason ?? new Error("Registration aborted"));
    const timeout = options.timeoutMs ?? 30_000;
    if (!Number.isFinite(timeout) || timeout <= 0) throw new TypeError("Invalid registration timeout");
    const id = this.uuid();
    const callbacks = new Map(definitions.map((definition, index) => [definition.name, { ...definition, execute: tools[index]!.execute }]));
    return new Promise((resolve, reject) => {
      const fail = (reason: unknown) => { if (this.pending?.id !== id) return; clearTimeout(this.pending.timer); this.pending.off(); this.pending = undefined; this.callbacks.clear(); reject(reason); };
      const abort = () => fail(options.signal?.reason ?? new Error("Registration aborted; registration outcome is unknown"));
      options.signal?.addEventListener("abort", abort, { once: true });
      this.pending = { id, tools: callbacks, resolve, reject, timer: setTimeout(() => fail(new Error("AI tool registration timed out; outcome is unknown")), timeout), off: () => options.signal?.removeEventListener("abort", abort) };
      try {
        const message = { v: 1, type: "tools.register", id, bindingId, tools: definitions } as const;
        assertToolPayload(message); this.send(message);
      } catch (error) { fail(error); }
    });
  }
  handle(value: unknown): boolean {
    if (!isAiToolMessage(value)) return false;
    if (value.bindingId !== this.current()) return true;
    if (value.type === "tools.registered") {
      const pending = this.pending;
      if (!pending || pending.id !== value.id) return true;
      clearTimeout(pending.timer); pending.off(); this.pending = undefined;
      if (value.ok) {
        if (!pending.tools.size) { for (const controller of this.running.values()) controller.abort(new Error("Tools unregistered")); }
        this.callbacks = pending.tools; pending.resolve({ names: value.names });
      }
      else pending.reject(new Error(value.error));
    } else if (value.type === "tools.cancel") {
      this.running.get(value.id)?.abort(new Error("Wallet cancelled tool invocation"));
    } else if (value.type === "tools.invoke") {
      if (this.seen.has(value.id)) return true;
      if (this.seen.size >= 10_000 || this.running.size >= 16) { this.reply(value.bindingId, value.id, { ok: false, error: "Too many tool invocations; reconnect explicitly" }); return true; }
      this.seen.add(value.id);
      const tool = this.callbacks.get(value.name);
      if (!tool) { this.reply(value.bindingId, value.id, { ok: false, error: "Tool is not registered on this connection" }); return true; }
      const controller = new AbortController(); this.running.set(value.id, controller);
      void (async () => {
        try {
          validateToolArguments(value.arguments, tool.parameters);
          const result = await tool.execute(structuredClone(value.arguments), { signal: controller.signal });
          controller.signal.throwIfAborted();
          assertToolPayload({ v: 1, type: "tools.result", bindingId: value.bindingId, id: value.id, ok: true, result });
          this.reply(value.bindingId, value.id, { ok: true, result });
        } catch {
          // App exceptions can contain secrets; never forward arbitrary stacks/messages to the model.
          this.reply(value.bindingId, value.id, { ok: false, error: controller.signal.aborted ? "Tool invocation cancelled; side effects may already have occurred" : "App tool execution failed" });
        } finally { this.running.delete(value.id); }
      })();
    }
    return true;
  }
  private reply(bindingId: string, id: string, payload: { ok: true; result: JSONValue } | { ok: false; error: string }) {
    if (this.current() !== bindingId) return;
    try { this.send({ v: 1, type: "tools.result", bindingId, id, ...payload }); } catch { /* Never replay a potentially side-effecting call. */ }
  }
  clear(reason: unknown): void {
    if (this.pending) { clearTimeout(this.pending.timer); this.pending.off(); this.pending.reject(reason); this.pending = undefined; }
    for (const controller of this.running.values()) controller.abort(reason);
    this.running.clear(); this.callbacks.clear(); this.seen.clear();
  }
}
