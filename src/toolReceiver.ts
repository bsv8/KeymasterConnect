import { assertToolPayload, isAiToolMessage, parseToolDefinitions, validateToolArguments, type AiToolDefinition, type AiToolMessage } from "./tools.js";
import type { JSONValue } from "./protocol.js";

export interface AiToolReceiverOptions {
  /** Must verify the same Receiver's current binding, exact peer, origin and wallet lifecycle. */
  isCurrent(bindingId: string): boolean;
  send(message: AiToolMessage): void;
  /** Host derives globally unique names and rejects conflicting live connection ownership. */
  names(definitions: readonly AiToolDefinition[]): string[];
  changed(): void;
  randomUUID?(): string;
}
/** Protocol-only reverse-call endpoint; owns no App authorization, funds or persistence. */
export class KeymasterAiToolReceiver {
  private definitions: AiToolDefinition[] = [];
  private bindingId: string | null = null;
  private pending = new Map<string, { bindingId: string; resolve(value: JSONValue): void; reject(error: unknown): void; cleanup(): void }>();
  private disposed = false;
  constructor(private options: AiToolReceiverOptions) {}
  /** Host calls on connection changes; revoke stale in-flight calls without replay. */
  sync(): void { if (this.bindingId && !this.options.isCurrent(this.bindingId)) this.clear(); }
  list(): readonly AiToolDefinition[] { return !this.disposed && this.bindingId && this.options.isCurrent(this.bindingId) ? structuredClone(this.definitions) : []; }
  available(name: string): boolean { return this.list().some(tool => tool.name === name); }
  handle(value: unknown): boolean {
    if (this.disposed || !isAiToolMessage(value)) return false;
    if (!this.options.isCurrent(value.bindingId)) return true;
    if (value.type === "tools.register") {
      try {
        const definitions = parseToolDefinitions(value.tools);
        if (this.pending.size && definitions.length) throw new Error("Cannot replace tools while calls are pending");
        if (!definitions.length && this.pending.size) this.clear();
        const names = this.options.names(definitions);
        this.options.send({ v: 1, type: "tools.registered", bindingId: value.bindingId, id: value.id, ok: true, names });
        this.definitions = definitions; this.bindingId = value.bindingId; this.options.changed();
      } catch {
        this.options.send({ v: 1, type: "tools.registered", bindingId: value.bindingId, id: value.id, ok: false, error: "Tool registration rejected: invalid schema, conflicting live connection or pending invocation" });
      }
    } else if (value.type === "tools.result") {
      const pending = this.pending.get(value.id);
      if (!pending || pending.bindingId !== value.bindingId) return true;
      pending.cleanup(); this.pending.delete(value.id);
      if (value.ok) pending.resolve(value.result); else pending.reject(new Error(`App tool failed: ${value.error}`));
    }
    return true;
  }
  invoke(name: string, args: Record<string, JSONValue>, signal: AbortSignal, timeoutMs = 120_000): Promise<JSONValue> {
    const tool = this.list().find(tool => tool.name === name), bindingId = this.bindingId;
    if (!tool || !bindingId) return Promise.reject(new Error("App tool is offline"));
    if (signal.aborted) return Promise.reject(signal.reason ?? new Error("Tool call aborted"));
    if (this.pending.size >= 16) return Promise.reject(new Error("Too many pending tool calls"));
    validateToolArguments(args, tool.parameters);
    const id = this.options.randomUUID?.() ?? crypto.randomUUID();
    return new Promise((resolve, reject) => {
      const fail = (error: unknown) => {
        const pending = this.pending.get(id); if (!pending) return;
        pending.cleanup(); this.pending.delete(id);
        if (this.options.isCurrent(bindingId)) {
          try { this.options.send({ v: 1, type: "tools.cancel", bindingId, id }); } catch { /* Cancellation cannot roll back side effects. */ }
        }
        reject(error);
      };
      const abort = () => fail(new Error("App tool cancelled; side effects may already have occurred"));
      const timer = setTimeout(() => fail(new Error("App tool timed out; outcome unknown, not retried")), timeoutMs);
      signal.addEventListener("abort", abort, { once: true });
      this.pending.set(id, { bindingId, resolve, reject, cleanup: () => { clearTimeout(timer); signal.removeEventListener("abort", abort); } });
      try {
        const message = { v: 1, type: "tools.invoke", bindingId, id, name, arguments: structuredClone(args) } as const;
        assertToolPayload(message); this.options.send(message);
      }
      catch { fail(new Error("Unable to deliver App tool call; outcome unknown")); }
    });
  }
  private clear(): void {
    for (const [id, pending] of this.pending) {
      try { this.options.send({ v: 1, type: "tools.cancel", bindingId: pending.bindingId, id }); } catch { /* Best effort. */ }
      pending.cleanup(); pending.reject(new Error("App connection lost; tool outcome unknown, not retried"));
    }
    this.pending.clear(); this.definitions = []; this.bindingId = null; this.options.changed();
  }
  dispose(): void {
    if (this.disposed) return;
    this.disposed = true; this.clear();
  }
}
