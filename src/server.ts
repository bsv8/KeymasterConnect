/** Connect v1 接收端。只拥有协议状态，不拥有钱包授权、私钥、余额或持久业务账本。 */
import {
  PROTOCOL_VERSION, sameNetworkIdentity, validateNetworkIdentity,
  type NetworkIdentity, type ProtocolMethod, type MethodParams, type MethodResult,
  type ProtocolError, type ProtocolResultMessage, type ProtocolEventPayload, type ProtocolReadyMessage, type ProtocolClosingMessage,
} from "./protocol.js";
import { parseRequestMessage, parseCancelMessage, ProtocolValidationError, assertOriginMatches } from "./validation.js";
export * from "./validation.js";
export * from "./appIdentity.js";
export type { ProtocolEventPayload } from "./protocol.js";

/** 窗口对象只作为消息源身份与发送目标；不读取跨源页面内容。 */
export interface ConnectPeer { postMessage(message: unknown, targetOrigin: string): void; readonly closed?: boolean; }
/** 来源由宿主装配；appView 的 origin 来自已验证的启动上下文。 */
export type ReceiverPeerPolicy =
  | { mode: "popup"; source: ConnectPeer | null }
  | { mode: "appView"; origin: string; source?: ConnectPeer | null };
/** 世代真值属于宿主；接收端仅作快照比较，重置或 Worker 更换后旧绑定失效。 */
export interface ReceiverLifecycle { walletGeneration?: string; runGeneration?: string; }
export interface ReceiverMessage { source: unknown; origin: string; data: unknown; }
export interface ConnectReceiverOptions {
  peer(): ReceiverPeerPolicy;
  lifecycle(): ReceiverLifecycle;
  /** 首次建立连接时读取真实钱包身份；不得从请求参数取值。 */
  identity(): Promise<NetworkIdentity>;
  send?(target: ConnectPeer, origin: string, message: ProtocolResultMessage): void;
  control?(target: ConnectPeer, message: ProtocolReadyMessage | ProtocolClosingMessage): void;
  randomUUID?(): string;
}
/** 只由接收端签发的已验证请求；业务代码不能凭同形对象获得回复/执行权。 */
export interface ReceiverRequest<M extends ProtocolMethod = ProtocolMethod> {
  readonly source: ConnectPeer;
  readonly origin: string;
  readonly id: string;
  readonly method: M;
  readonly params: MethodParams<M>;
  readonly networkIdentity: NetworkIdentity;
  readonly walletGeneration: string;
  readonly runGeneration: string;
  readonly bindingId?: string;
  readonly signal: AbortSignal;
}
interface Binding { id: string; origin: string; identity: NetworkIdentity; walletGeneration: string; runGeneration: string; }
interface Pending { context: ReceiverRequest; abort: AbortController; }

/** 判断建立连接的方法；ready 只表示传输可用，不属于身份授权。 */
export function isEstablishing(method: string): boolean { return ["connect.login", "connect.resume", "connect.launch"].includes(method); }

/** 生产钱包与闭环测试共用同一接收端，不内置测试业务或默认自动授权。 */
export class KeymasterConnectReceiver {
  private readonly bindings = new Map<ConnectPeer, Binding>();
  private readonly pending = new Map<ConnectPeer, Map<string, Pending>>();
  private appViewSource: ConnectPeer | null = null;
  private closingSent = false;
  private epoch = 0;
  constructor(private readonly options: ConnectReceiverOptions) {}

  /** 每次从宿主读取来源策略；只接受 HTTP(S) 实际来源，拒绝 opaque origin。 */
  isAllowedPeer(event: ReceiverMessage, claim = false): event is ReceiverMessage & { source: ConnectPeer } {
    if (!event.source) return false;
    try { const url = new URL(event.origin); if (!["http:", "https:"].includes(url.protocol) || url.origin !== event.origin) return false; }
    catch { return false; }
    const policy = this.options.peer();
    if (policy.mode === "popup") return !!policy.source && event.source === policy.source;
    if (event.origin !== policy.origin) return false;
    const expected = policy.source || this.appViewSource;
    if (expected && event.source !== expected) return false;
    if (claim) this.appViewSource = event.source as ConnectPeer;
    return true;
  }

  /** appView 首条合法 ready 才认领来源；无效版本和外来窗口不改变绑定。 */
  acceptReady(event: ReceiverMessage): boolean {
    const data = event.data as { v?: unknown; type?: unknown } | null;
    return this.options.peer().mode === "appView" && data?.v === PROTOCOL_VERSION && data.type === "ready" && this.isAllowedPeer(event, true);
  }

  /** 校验并签发请求上下文。重复在途 ID 被忽略；非法可信请求返回标准错误。 */
  async accept(event: ReceiverMessage): Promise<ReceiverRequest | null> {
    if (!this.isAllowedPeer(event)) return null;
    const raw = event.data as Record<string, unknown> | null;
    if (!raw || typeof raw !== "object" || raw.type !== "request") return null;
    // 重复 ID 不能借非法参数生成第二条错误响应并截断原请求的等待。
    if (typeof raw.id === "string" && this.pending.get(event.source)?.has(raw.id)) return null;
    try {
      if (raw.v !== PROTOCOL_VERSION) throw new ProtocolValidationError("invalid_request", "Unsupported protocol version; update Connect SDK");
      const receiverEpoch = this.epoch;
      const before = this.options.lifecycle();
      if (!before.walletGeneration || !before.runGeneration) throw new ProtocolValidationError("invalid_request", "Wallet is not initialized");
      const establishing = typeof raw.method === "string" && isEstablishing(raw.method);
      const binding = this.bindings.get(event.source!);
      if (!establishing && (!binding || binding.origin !== event.origin || raw.bindingId !== binding.id || binding.walletGeneration !== before.walletGeneration || binding.runGeneration !== before.runGeneration)) {
        throw new ProtocolValidationError("connection_expired", "Wallet connection expired; reconnect explicitly");
      }
      if (establishing && raw.bindingId !== undefined) throw new ProtocolValidationError("invalid_request", "Establishment must not reuse a binding");
      const identity = establishing ? validateNetworkIdentity(await this.options.identity()) : binding!.identity;
      const after = this.options.lifecycle();
      if (receiverEpoch !== this.epoch || before.walletGeneration !== after.walletGeneration || before.runGeneration !== after.runGeneration || !this.isAllowedPeer(event)) throw new ProtocolValidationError("connection_expired", "Wallet changed during connection");
      const parsed = parseRequestMessage(raw, identity);
      if (parsed.method === "identity.get" || parsed.method === "intent.sign") assertOriginMatches((parsed.params as { aud: string }).aud, event.origin);
      let requests = this.pending.get(event.source!);
      if (requests?.has(parsed.id)) return null;
      if (!requests) { requests = new Map(); this.pending.set(event.source!, requests); }
      const abort = new AbortController();
      const context: ReceiverRequest = Object.freeze({ ...parsed, source: event.source!, origin: event.origin,
        networkIdentity: identity, walletGeneration: before.walletGeneration, runGeneration: before.runGeneration,
        bindingId: establishing ? undefined : binding!.id, signal: abort.signal });
      this.isAllowedPeer(event, true);
      requests.set(parsed.id, { context, abort });
      return context;
    } catch (error) {
      const failure = error instanceof ProtocolValidationError ? error : new ProtocolValidationError("internal_error", "Wallet identity could not be read");
      if (typeof raw.id === "string" && raw.id && this.isAllowedPeer(event)) this.send(event.source!, event.origin, { v: PROTOCOL_VERSION, type: "result", id: raw.id, ok: false, error: { code: failure.code, message: failure.message } });
      return null;
    }
  }

  /** 取消只通知宿主；宿主决定是否仍可取消，执行中的不可逆操作不能被协议回滚。 */
  acceptCancel(event: ReceiverMessage): ReceiverRequest | null {
    if (!this.isAllowedPeer(event)) return null;
    try {
      const parsed = parseCancelMessage(event.data);
      const pending = this.pending.get(event.source!)?.get(parsed.id);
      if (!pending || pending.context.origin !== event.origin) return null;
      if (pending.context.bindingId && (event.data as { bindingId?: unknown }).bindingId !== pending.context.bindingId) return null;
      this.assertCurrent(pending.context);
      pending.abort.abort();
      return pending.context;
    } catch { return null; }
  }

  /** 宿主在排队结束及不可逆业务前复核；这里只判断协议权威，不代替资金审批。 */
  assertCurrent(context: ReceiverRequest): void {
    if (this.pending.get(context.source)?.get(context.id)?.context !== context) throw new ProtocolValidationError("connection_expired", "Request authority is no longer active");
    const lifecycle = this.options.lifecycle();
    if (context.walletGeneration !== lifecycle.walletGeneration || context.runGeneration !== lifecycle.runGeneration || !this.isAllowedPeer({ ...context, data: null })) throw new ProtocolValidationError("connection_expired", "Wallet connection expired; reconnect explicitly");
    if (!isEstablishing(context.method)) {
      const binding = this.bindings.get(context.source);
      if (!binding || binding.id !== context.bindingId || binding.origin !== context.origin || !sameNetworkIdentity(binding.identity, context.networkIdentity)) throw new ProtocolValidationError("connection_expired", "Connection binding was revoked");
    }
  }

  /** 回复成功时才签发新的连接绑定；业务返回值必须已由宿主转换成公开 DTO。 */
  replyResult<M extends ProtocolMethod>(context: ReceiverRequest<M>, result: MethodResult<M>): void {
    this.assertCurrent(context);
    let bindingId = context.bindingId;
    let publicResult: MethodResult = result;
    if (isEstablishing(context.method)) {
      const connected = result as { networkIdentity?: unknown; walletPublicKeyHex?: unknown; ownerPublicKeyHex?: unknown };
      if (!sameNetworkIdentity(validateNetworkIdentity(connected.networkIdentity), context.networkIdentity) || "walletPublicKeyHex" in connected || "ownerPublicKeyHex" in connected) throw new ProtocolValidationError("invalid_request", "Invalid public connection result");
      publicResult = { ...result, networkIdentity: context.networkIdentity } as MethodResult;
      bindingId = this.options.randomUUID?.() || crypto.randomUUID();
      this.bindings.set(context.source, { id: bindingId, origin: context.origin, identity: context.networkIdentity, walletGeneration: context.walletGeneration, runGeneration: context.runGeneration });
    }
    this.finish(context);
    if (context.method === "connect.logout") this.bindings.delete(context.source);
    this.send(context.source, context.origin, { v: PROTOCOL_VERSION, type: "result", id: context.id, ok: true, networkIdentity: context.networkIdentity, bindingId: bindingId!, result: publicResult });
  }

  /** 失败仍属于原请求；不额外生成取消响应，不误撤销同窗口后来建立的新绑定。 */
  replyError(context: ReceiverRequest, error: ProtocolError): void {
    if (this.pending.get(context.source)?.get(context.id)?.context !== context) return;
    this.finish(context);
    this.send(context.source, context.origin, { v: PROTOCOL_VERSION, type: "result", id: context.id, ok: false, networkIdentity: context.networkIdentity, error });
  }

  /** 事件只给当前有效绑定添加接收端上下文；业务发布者不能自报绑定/钱包身份。 */
  sendEvent(target: ConnectPeer, origin: string, event: ProtocolEventPayload): void {
    const binding = this.bindings.get(target);
    const lifecycle = this.options.lifecycle();
    if (!binding || binding.origin !== origin || binding.walletGeneration !== lifecycle.walletGeneration || binding.runGeneration !== lifecycle.runGeneration || !this.isAllowedPeer({ source: target, origin, data: null })) return;
    try { target.postMessage({ ...event, networkIdentity: binding.identity, bindingId: binding.id }, origin); } catch { /* 窗口退出不重试推送。 */ }
  }

  /** ready/closing 只承载生命周期，不携带授权或业务结果。 */
  sendReady(target: ConnectPeer): void { this.sendControl(target, "ready"); }
  /** 同一运行期至多通知一次 closing，发送失败不重试。 */
  sendClosing(target: ConnectPeer): void {
    if (this.closingSent) return;
    this.closingSent = true; this.sendControl(target, "closing");
  }
  /** 生命周期控制帧不包含敏感业务数据，未建绑定时也可以发送。 */
  private sendControl(target: ConnectPeer, type: "ready" | "closing"): void {
    try {
      if (target.closed) return;
      const message: ProtocolReadyMessage | ProtocolClosingMessage = { v: PROTOCOL_VERSION, type };
      if (this.options.control) this.options.control(target, message); else target.postMessage(message, "*");
    } catch { /* 关闭通知为尽力发送。 */ }
  }

  /** 开始新的 Session Window 运行期，才重置 closing 一次性通知。 */
  reset(): void { this.clear(); this.closingSent = false; }

  /** clear 仅清协议运行态；授权撤销和业务责任收尾必须由宿主另外执行。 */
  clear(): void {
    this.epoch++;
    for (const requests of this.pending.values()) for (const pending of requests.values()) pending.abort.abort();
    this.pending.clear(); this.bindings.clear(); this.appViewSource = null;
  }

  /** 终态释放请求关联，不保留业务结果或交易材料。 */
  private finish(context: ReceiverRequest): void {
    const requests = this.pending.get(context.source);
    requests?.delete(context.id); if (!requests?.size) this.pending.delete(context.source);
  }
  /** 精确 origin 回复，窗口退出时不重试，不能据发送成功宣告业务提交成功。 */
  private send(target: ConnectPeer, origin: string, message: ProtocolResultMessage): void {
    try { if (target.closed) return; if (this.options.send) this.options.send(target, origin, message); else target.postMessage(message, origin); } catch { /* 业务责任不因传输失败消失。 */ }
  }
}
