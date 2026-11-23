import { AiToolClient } from "./toolClient.js";
import { readOwnPublicationRecord } from "./internal/publicationProof.js";
import type { AiTool, AiToolsRegistered } from "./tools.js";
import {
  PROTOCOL_VERSION, PROTOCOL_METHODS,
  validateNetworkIdentity, sameNetworkIdentity, type NetworkIdentity,
  type ChannelPublishParams,
  type ChannelPublishResult,
  type ChannelSubscriptionSetParams,
  type ChannelSubscriptionSetResult,
  type CipherDecryptParams,
  type CipherDecryptResult,
  type CipherEncryptParams,
  type CipherEncryptResult,
  type ConnectLaunchParams,
  type ConnectLaunchResult,
  type ConnectLoginParams,
  type ConnectLoginResult,
  type ConnectLogoutResult,
  type DomainProfile,
  type DomainProfilesResult,
  type IdentityGetParams,
  type IdentityGetResult,
  type IntentSignParams,
  type IntentSignResult,
  type MethodParams,
  type MethodResult,
  type MsFileBlockReadParams,
  type MsFileReadResult,
  type MsFileSeedReadParams,
  type MsFileStatParams,
  type MsFileStatResult,
  type PaymentPayParams,
  type PaymentPayResult,
  type PaymentStatusParams,
  type PaymentStatusResult,
  type ProtocolErrorCode,
  type ProtocolEventMessage,
  type ProtocolMethod,
  type ProtocolResultMessage,
} from "./protocol.js";

/** iframe：钱包内嵌；appView：钱包弹出 App；popup：App 主动打开钱包。 */
export type KeymasterConnectMode = "iframe" | "appView" | "popup";

export interface DomainQueryOptions extends Pick<KeymasterRequestOptions, "signal"> {
  /** Omit to use the wallet's default service for the current network. */
  serviceId?: string;
}

/** Observable lifecycle of the browser transport. */
export type KeymasterConnectState = "idle" | "opening" | "connected" | "disconnected";

/** Failures produced by the browser transport before a protocol result exists. */
export type KeymasterTransportErrorCode =
  | "wallet_closed"
  | "popup_blocked"
  | "ready_timeout"
  | "request_timeout"
  | "send_failed"
  | "not_embedded"
  | "no_opener"
  | "appview_session_lost"
  | "client_closed"
  | "unsupported_protocol";

/** A browser transport failure. Protocol rejections use {@link KeymasterProtocolError}. */
export class KeymasterTransportError extends Error {
  constructor(
    public readonly code: KeymasterTransportErrorCode,
    message: string
  ) {
    super(message);
    this.name = "KeymasterTransportError";
  }
}

/** A structured rejection returned by Keymaster. */
export class KeymasterProtocolError extends Error {
  constructor(
    public readonly code: ProtocolErrorCode,
    message: string
  ) {
    super(message);
    this.name = "KeymasterProtocolError";
  }
}

/** Options applying to one protocol request. */
export interface KeymasterRequestOptions {
  /** Caller-controlled correlation id. A UUID is generated when omitted. */
  requestId?: string;
  /** Per-request timeout in milliseconds. */
  timeoutMs?: number;
  /** Aborting sends a best-effort protocol cancel and rejects the local promise. */
  signal?: AbortSignal;
}

/** Injectable browser primitives used by tests and embedded runtimes. */
export interface KeymasterBrowserEnvironment {
  open(url: string, target: string, features: string): Window | null;
  opener(): Window | null;
  parent(): Window | null;
  addMessageListener(listener: (event: MessageEvent) => void): void;
  removeMessageListener(listener: (event: MessageEvent) => void): void;
  setTimeout(handler: () => void, timeoutMs: number): number;
  clearTimeout(timer: number): void;
  setInterval(handler: () => void, intervalMs: number): number;
  clearInterval(timer: number): void;
  randomUUID(): string;
  /** 页面离开时清理本地资源，不等待远端。 */
  addPageHideListener?(listener: () => void): void;
  removePageHideListener?(listener: () => void): void;
}

/** Configuration for {@link KeymasterConnectClient}. */
export interface KeymasterConnectOptions {
  /** Exact Keymaster deployment origin supplied by the host application. */
  targetOrigin: string;
  /** 默认 popup；钱包启动的应用根据 URL mode 选择 iframe 或 appView。 */
  mode?: KeymasterConnectMode;
  /** App 主动打开完整钱包的路径；必须位于 targetOrigin。 */
  popupPath?: string;
  /** 等待完整钱包初始化/解锁并发送 ready 的最长时间，默认两分钟；超时不关闭钱包。 */
  readyTimeoutMs?: number;
  /** Default request timeout. Defaults to two minutes. */
  requestTimeoutMs?: number;
  /** Session Window close detection interval. Defaults to 500ms. */
  closePollMs?: number;
  /** 接收当前精确订阅频道上的已验签 Channel 事件。 */
  onEvent?: (event: ProtocolEventMessage) => void;
  /** Receives transport lifecycle changes. */
  onStateChange?: (state: KeymasterConnectState) => void;
  /** Optional browser adapter, normally only supplied by tests. */
  environment?: KeymasterBrowserEnvironment;
}

interface PendingRequest {
  method: ProtocolMethod;
  resolve(value: unknown): void;
  reject(reason: unknown): void;
  timer: number;
  signal?: AbortSignal;
  abortListener?: () => void;
}

const DEFAULT_READY_TIMEOUT_MS = 120_000;
const DEFAULT_REQUEST_TIMEOUT_MS = 120_000;
const DEFAULT_CLOSE_POLL_MS = 500;

/**
 * Official browser client for Keymaster Connect V1.
 *
 * 一个客户端关联一个完整钱包窗口，但不拥有关闭钱包的权利。It validates both the exact
 * message origin and the source window, correlates concurrent requests by id,
 * supports protocol cancellation through `AbortSignal`, and keeps persistent
 * Connect sessions separate from the window transport lifecycle.
 *
 * @example Direct popup login
 * ```ts
 * const keymaster = new KeymasterConnectClient({
 *   targetOrigin: keymasterDeploymentOrigin
 * });
 *
 * const session = await keymaster.login({
 *   text: "Sign in to Example",
 *   claims: ["profile.name"]
 * });
 * ```
 *
 * @example appView launch
 * ```ts
 * const keymaster = new KeymasterConnectClient({
 *   targetOrigin: sessionWindowOrigin,
 *   mode: "appView"
 * });
 *
 * await keymaster.connect();
 * const session = await keymaster.launch({ launchToken });
 * ```
 *
 * @groupDescription Connect
 * 建立、撤销或启动 Connect 连接。
 *
 * @groupDescription Identity
 * Read signed identity claims or sign an application intent.
 *
 * @groupDescription Cipher
 * Encrypt and decrypt origin-bound application data.
 *
 * @groupDescription Payment
 * Submit business outputs and query payment status.
 *
 * @groupDescription Channel
 * Publish JSON content and manage exact-channel subscriptions. Incoming
 * messages arrive as `channel.message_received` events.
 *
 *
 * @groupDescription Transport
 * Manage the Session Window and send lower-level protocol requests.
 */
export class KeymasterConnectClient {
  readonly domain = {
    /** Read the primary domain's public profile for one public key. */
    profile: async (publicKeyHex: string, options?: DomainQueryOptions): Promise<DomainProfile> => {
      const { results: [result] } = await this.domain.profiles([publicKeyHex], options);
      if ("error" in result) throw new KeymasterProtocolError(result.error.code, "Domain profile unavailable");
      return result.profile;
    },
    /** Read public profiles in input order, with per-key errors. */
    profiles: (publicKeys: string[], { serviceId, signal }: DomainQueryOptions = {}): Promise<DomainProfilesResult> =>
      this.request("domain.profiles", { publicKeys, serviceId }, { signal }),
    /** Read the current owner's compressed public key for a domain. */
    getPublicKey: async (domain: string, { serviceId, signal }: DomainQueryOptions = {}): Promise<string> => {
      const result = await this.request("domain.get_public_key", { domain, serviceId }, { signal });
      return result.publicKeyHex;
    }
  };

  private identityValue: Readonly<NetworkIdentity> | null = null;
  private bindingId: string | null = null;
  private readonly aiTools = new AiToolClient(
    () => this.stateValue === "connected" ? this.bindingId : null,
    message => { if (!this.sessionWindow || isWindowClosed(this.sessionWindow)) throw new Error("Wallet unavailable"); this.sessionWindow.postMessage(message, this.targetOrigin); },
    () => this.environment.randomUUID()
  );

  /** Replace this connection's tool set. Empty array unregisters all tools. Re-register explicitly after reconnect. */
  registerTools(tools: AiTool[], options: Pick<KeymasterRequestOptions, "signal" | "timeoutMs"> = {}): Promise<AiToolsRegistered> {
    return this.aiTools.register(tools, options);
  }

  /** Identity returned by the authenticated wallet, or null before establishment. */
  get networkIdentity(): Readonly<NetworkIdentity> | null { return this.identityValue; }
  private readonly targetOrigin: string;
  private readonly mode: KeymasterConnectMode;
  private readonly environment: KeymasterBrowserEnvironment;
  private readonly options: Required<Pick<KeymasterConnectOptions,
    "popupPath" | "readyTimeoutMs" | "requestTimeoutMs" | "closePollMs">> & KeymasterConnectOptions;
  private readonly pending = new Map<string, PendingRequest>();
  private stateValue: KeymasterConnectState = "idle";
  private sessionWindow: Window | null = null;
  private listenerInstalled = false;
  private readyPromise: Promise<void> | null = null;
  private readyResolve: (() => void) | null = null;
  private readyReject: ((reason: unknown) => void) | null = null;
  private readyTimer: number | null = null;
  private closePoller: number | null = null;
  private authorizationId: string | null = null;
  /** 等待 ready 与授权响应共用一个建连位置，取消不能影响其他调用。 */
  private establishmentActive = false;

  constructor(options: KeymasterConnectOptions) {
    if ("networkIdentity" in options) throw new TypeError("networkIdentity option has been removed; read identity from the connection result");
    this.targetOrigin = normalizeHttpOrigin(options.targetOrigin);
    this.mode = options.mode ?? "popup";
    if (!["iframe", "appView", "popup"].includes(this.mode)) throw new TypeError("Invalid Connect transport mode");
    this.options = {
      ...options,
      popupPath: options.popupPath ?? "/",
      readyTimeoutMs: positiveNumber(options.readyTimeoutMs ?? DEFAULT_READY_TIMEOUT_MS, "readyTimeoutMs"),
      requestTimeoutMs: positiveNumber(options.requestTimeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS, "requestTimeoutMs"),
      closePollMs: positiveNumber(options.closePollMs ?? DEFAULT_CLOSE_POLL_MS, "closePollMs")
    };
    this.environment = options.environment ?? createBrowserEnvironment();
  }

  /**
   * Current browser transport state.
   *
   * @group Transport
   */
  get state(): KeymasterConnectState {
    return this.stateValue;
  }

  /**
   * Establishes the browser transport.
   *
   * @group Transport
   */
  connect(): Promise<void> {
    return this.mode === "popup" ? this.connectPopup() : this.connectAppView();
  }

  /**
   * Sends any public Connect method with compile-time parameter and result
   * inference.
   *
   * @group Transport
   */
  async request<M extends ProtocolMethod>(
    method: M,
    params: MethodParams<M>,
    options: KeymasterRequestOptions = {}
  ): Promise<MethodResult<M>> {
    if (options.signal?.aborted) throw abortReason(options.signal);
    if (!PROTOCOL_METHODS.includes(method)) throw new TypeError("Unknown Connect method");
    if (!params || typeof params !== "object" || Array.isArray(params)) throw new TypeError("params must be an object");
    for (const field of ["walletPublicKeyHex", "networkIdentity", "bsvNetwork", "assetId"]) {
      if (field in params) throw new TypeError(`Removed wallet selector: ${field}`);
    }
    const establishing = ["connect.login", "connect.launch"].includes(method);
    if (this.establishmentActive) throw new TypeError("Connection establishment is already pending");
    if (establishing) this.establishmentActive = true;
    try {
      // 建连证明在传输层统一附带：无论调用方走 login()/launch() 便捷方法还是
      // 直接 request("connect.login"/"connect.launch")，当前入口的发布记录
      // 字符串都会被整体附上（若有）；解码、验签与来源核对全部归钱包。
      let effectiveParams = params;
      if ((method === "connect.login" || method === "connect.launch") && (params as Record<string, unknown>).publicationProof === undefined) {
        effectiveParams = withOwnPublicationRecord(params);
      }
      if (establishing && this.pending.size) throw new TypeError("Cannot establish a connection while requests are pending");
      if (!establishing && !this.bindingId) throw new KeymasterProtocolError("invalid_request", "Login or launch before making business requests");
      if ([...this.pending.values()].some(request => ["connect.login", "connect.launch"].includes(request.method))) throw new TypeError("Connection establishment is already pending");
      // 只有显式建连可以打开窗口。业务仅使用现有传输，失效直接断开。
      if (establishing) {
        const abortOpening = () => this.disconnect(abortReason(options.signal!));
        options.signal?.addEventListener("abort", abortOpening, { once: true });
        try { await this.connect(); }
        finally { options.signal?.removeEventListener("abort", abortOpening); }
      }
      if (establishing && this.pending.size) throw new TypeError("Cannot establish a connection while requests are pending");
      if ([...this.pending.values()].some(request => ["connect.login", "connect.launch"].includes(request.method))) throw new TypeError("Connection establishment is already pending");
      if (options.signal?.aborted) throw abortReason(options.signal);

      const target = this.sessionWindow;
      if (!target || isWindowClosed(target) || (!establishing && this.stateValue !== "connected")) {
        const error = new KeymasterTransportError("wallet_closed", "Wallet connection is unavailable; login again");
        this.disconnect(error);
        throw error;
      }
      const requestId = options.requestId ?? this.environment.randomUUID();
      if (!requestId || this.pending.has(requestId)) {
        throw new TypeError("requestId must be non-empty and unique among pending requests");
      }
      const timeoutMs = positiveNumber(options.timeoutMs ?? this.options.requestTimeoutMs, "timeoutMs");

      return await new Promise<MethodResult<M>>((resolve, reject) => {
        const timer = this.environment.setTimeout(() => {
          this.postCancel(requestId);
          this.deletePending(requestId);
          const error = new KeymasterTransportError("request_timeout", `Keymaster request timed out: ${method}`);
          if (establishing) this.disconnect(error);
          reject(error);
        }, timeoutMs);
        const abortListener = options.signal
          ? () => {
              this.postCancel(requestId);
              this.deletePending(requestId);
              if (establishing) this.disconnect(abortReason(options.signal!));
              reject(abortReason(options.signal!));
            }
          : undefined;
        if (abortListener) options.signal!.addEventListener("abort", abortListener, { once: true });
        this.pending.set(requestId, {
          method,
          resolve: (value) => resolve(value as MethodResult<M>),
          reject,
          timer,
          signal: options.signal,
          abortListener
        });

        try {
          target.postMessage({
            v: PROTOCOL_VERSION,
            type: "request",
            ...(!establishing ? { bindingId: this.bindingId } : {}),
            id: requestId,
            method,
            params: effectiveParams
          }, this.targetOrigin);
        } catch (cause) {
          this.deletePending(requestId);
          const error = new KeymasterTransportError("send_failed", errorMessage(cause, "Unable to send Keymaster request"));
          this.disconnect(error);
          reject(error);
        }
      });
    } finally {
      if (establishing) this.establishmentActive = false;
    }
  }

  /**
   * Calls `connect.login` to create a persistent Connect session.
   *
   * @group Connect
   */
  login(params: ConnectLoginParams, options?: KeymasterRequestOptions): Promise<ConnectLoginResult> {
    return this.request("connect.login", params, options);
  }

  /**
   * Calls `connect.logout` to revoke a persistent Connect session.
   *
   * @group Connect
   */
  logout(options?: KeymasterRequestOptions): Promise<ConnectLogoutResult> {
    if (options !== undefined && (typeof options !== "object" || options === null)) return Promise.reject(new TypeError("logout no longer accepts a wallet public key"));
    return this.request("connect.logout", {}, options);
  }

  /**
   * Calls `connect.launch` to consume the one-time launch token of an appView
   * session.
   *
   * @group Connect
   */
  launch(params: ConnectLaunchParams, options?: KeymasterRequestOptions): Promise<ConnectLaunchResult> {
    return this.request("connect.launch", params, options);
  }

  /**
   * Calls `identity.get` to return signed identity claims for the session
   * owner.
   *
   * @group Identity
   */
  identityGet(params: IdentityGetParams, options?: KeymasterRequestOptions): Promise<IdentityGetResult> {
    return this.request("identity.get", params, options);
  }

  /**
   * Calls `intent.sign` to sign caller-provided bytes with a human-readable
   * intent.
   *
   * @group Identity
   */
  intentSign(params: IntentSignParams, options?: KeymasterRequestOptions): Promise<IntentSignResult> {
    return this.request("intent.sign", params, options);
  }

  /**
   * Calls `cipher.encrypt` to encrypt origin-bound application data.
   *
   * @group Cipher
   */
  cipherEncrypt(params: CipherEncryptParams, options?: KeymasterRequestOptions): Promise<CipherEncryptResult> {
    return this.request("cipher.encrypt", params, options);
  }

  /**
   * Calls `cipher.decrypt` to decrypt data previously returned by
   * `cipher.encrypt`.
   *
   * @group Cipher
   */
  cipherDecrypt(params: CipherDecryptParams, options?: KeymasterRequestOptions): Promise<CipherDecryptResult> {
    return this.request("cipher.decrypt", params, options);
  }

  /**
   * 请求 `payment.pay`；资金审批、选币与持久幂等由钱包负责。
   * Promise resolve 不等于已广播，应检查返回状态。
   *
   * @group Payment
   */
  paymentPay(params: PaymentPayParams, options?: KeymasterRequestOptions): Promise<PaymentPayResult> {
    return this.request("payment.pay", params, options);
  }

  /** 按原业务 ID 只读查询付款状态，不自动重付或更换 ID。 */
  readonly payment = {
    prepare: (params: MethodParams<"payment.prepare">, options?: KeymasterRequestOptions) => this.request("payment.prepare", params, options),
    commit: (params: MethodParams<"payment.commit">, options?: KeymasterRequestOptions) => this.request("payment.commit", params, options),
    cancel: (params: MethodParams<"payment.cancel">, options?: KeymasterRequestOptions) => this.request("payment.cancel", params, options),
    status: (params: PaymentStatusParams, options?: KeymasterRequestOptions) => this.paymentStatus(params, options),
  };

  readonly chain = {
    getHeight: (options?: KeymasterRequestOptions) => this.request("chain.get_height", {}, options),
    listScriptHistory: (params: MethodParams<"chain.list_script_history">, options?: KeymasterRequestOptions) =>
      this.request("chain.list_script_history", params, options),
    getTransaction: (txid: string, options?: KeymasterRequestOptions & { observedRawTxHex?: string }) =>
      this.request("chain.get_transaction", { txid, observedRawTxHex: options?.observedRawTxHex }, options),
    listScriptUnspent: (script: string, options?: KeymasterRequestOptions) => this.request("chain.list_script_unspent", { script }, options),
    broadcast: (rawTxHex: string, options?: KeymasterRequestOptions) => this.request("chain.broadcast", { rawTxHex }, options),
  };

  readonly application = {
    getPublicKey: (purpose: string, options?: KeymasterRequestOptions) => this.request("application.key", { purpose }, options),
    signMessage: (params: MethodParams<"application.sign_message">, options?: KeymasterRequestOptions) =>
      this.request("application.sign_message", params, options),
    signPayment: (params: MethodParams<"application.sign_payment">, options?: KeymasterRequestOptions) =>
      this.request("application.sign_payment", params, options),
  };

  /** File import, discovery, and reading through the wallet. @group MSFile */
  readonly msfile = {
    /** Check whether the active wallet can serve newly imported files. */
    sellerStatus: (options?: KeymasterRequestOptions) => this.request("msfile.seller.status", {}, options),
    /** Import a complete file and wait for it to be available to the seller. */
    import: (params: MethodParams<"msfile.import">, options?: KeymasterRequestOptions) => this.request("msfile.import", params, options),
    /** Read a complete file by seed hash, discovering and buying it if needed. */
    read: (seedHashHex: string, options?: KeymasterRequestOptions) => this.request("msfile.content.read", { seedHashHex }, options),
    /** Check availability in the wallet and at its configured suppliers. */
    stat: (params: MsFileStatParams, options?: KeymasterRequestOptions): Promise<MsFileStatResult> =>
      this.request("msfile.stat", params, options),
    /** Read a MasterSeed from a specific source. The wallet handles any purchase. */
    readSeed: (params: MsFileSeedReadParams, options?: KeymasterRequestOptions): Promise<MsFileReadResult> =>
      this.request("msfile.seed.read", params, options),
    /** Read a single block from a specific source. The wallet handles any purchase. */
    readBlock: (params: MsFileBlockReadParams, options?: KeymasterRequestOptions): Promise<MsFileReadResult> =>
      this.request("msfile.block.read", params, options),
  };

  paymentStatus(params: PaymentStatusParams, options?: KeymasterRequestOptions): Promise<PaymentStatusResult> {
    return this.request("payment.status", params, options);
  }

  /**
   * 发布到任意精确频道；owner、公钥签名和消息编号由 Keymaster 生成。
   *
   * @group Channel
   */
  channelPublish(
    params: ChannelPublishParams,
    options?: KeymasterRequestOptions
  ): Promise<ChannelPublishResult> {
    return this.request("channel.publish", params, options);
  }

  /**
   * 替换当前 Connect caller 的精确频道订阅集合；传空数组表示释放。
   *
   * @group Channel
   */
  channelSubscriptionSet(
    params: ChannelSubscriptionSetParams,
    options?: KeymasterRequestOptions
  ): Promise<ChannelSubscriptionSetResult> {
    return this.request("channel.subscription_set", params, options);
  }

  /**
   * Cancels a locally pending request. Keymaster only cancels work that has not
   * entered execution; cancellation is therefore best-effort remotely.
   *
   * @group Transport
   */
  cancel(requestId: string, reason: unknown = new DOMException("The operation was aborted", "AbortError")): boolean {
    const pending = this.pending.get(requestId);
    if (!pending) return false;
    this.postCancel(requestId);
    this.deletePending(requestId);
    if (pending.method === "connect.login" || pending.method === "connect.launch") this.disconnect(reason);
    pending.reject(reason);
    return true;
  }

  private connectPopup(): Promise<void> {
    if (this.isConnected()) return Promise.resolve();
    if (this.readyPromise) return this.readyPromise;
    const url = new URL(this.options.popupPath, `${this.targetOrigin}/`);
    if (url.origin !== this.targetOrigin) return Promise.reject(new TypeError("popupPath must resolve inside targetOrigin"));
    this.installListener();
    // 先建立等待和取消入口，再通知调用方；opening 回调可能同步取消或卸载页面。
    const ready = new Promise<void>((resolve, reject) => {
      this.readyResolve = resolve;
      this.readyReject = reject;
      this.readyTimer = this.environment.setTimeout(() => this.disconnect(new KeymasterTransportError("ready_timeout", "Timed out waiting for the wallet to initialize or unlock")), this.options.readyTimeoutMs);
    });
    this.readyPromise = ready;
    this.setState("opening");
    if (this.readyPromise !== ready) return ready;
    try {
      const target = this.environment.open(url.href, "_blank", "");
      // open 的浏览器适配器也可能触发同步取消，结束的尝试不能重新安装资源。
      if (this.readyPromise !== ready) return ready;
      if (!target) {
        this.disconnect(new KeymasterTransportError("popup_blocked", "Keymaster wallet window was blocked"));
      } else {
        this.sessionWindow = target;
        this.startClosePolling();
      }
    } catch (cause) {
      this.disconnect(new KeymasterTransportError("send_failed", errorMessage(cause, "Unable to open Keymaster wallet")));
    }
    return ready;
  }

  private connectAppView(): Promise<void> {
    if (this.isConnected()) return Promise.resolve();
    const parent = this.mode === "iframe" ? this.environment.parent() : this.environment.opener();
    if (!parent || isWindowClosed(parent)) {
      const code: KeymasterTransportErrorCode = this.stateValue === "idle"
        ? (this.mode === "iframe" ? "not_embedded" : "no_opener")
        : "appview_session_lost";
      this.setState("disconnected");
      return Promise.reject(new KeymasterTransportError(
        code,
        "Wallet launcher unavailable; launch the app from Keymaster"
      ));
    }
    this.installListener();
    this.sessionWindow = parent;
    try {
      parent.postMessage({ v: PROTOCOL_VERSION, type: "ready" }, this.targetOrigin);
    } catch (cause) {
      this.sessionWindow = null;
      this.setState("disconnected");
      return Promise.reject(new KeymasterTransportError("send_failed", errorMessage(cause, "Unable to send appView ready")));
    }
    this.startClosePolling();
    this.setState("connected");
    return Promise.resolve();
  }

  private readonly handleMessage = (event: MessageEvent): void => {
    if (!this.sessionWindow || event.origin !== this.targetOrigin || event.source !== this.sessionWindow) return;
    const value = event.data as Record<string, unknown> | null;
    if (!value || typeof value.type !== "string") return;
    if (value.v !== PROTOCOL_VERSION) {
      if (value.type === "ready" || value.type === "result") this.disconnect(new KeymasterTransportError("unsupported_protocol", "Incompatible Keymaster protocol version"));
      return;
    }

    if (this.aiTools.handle(value)) return;
    if (value.type === "ready") {
      if (this.mode === "popup" && this.readyPromise) this.finishReady();
      else if (this.bindingId) this.disconnect(new KeymasterTransportError("wallet_closed", "Wallet runtime changed; login again"));
      return;
    }
    if (value.type === "closing") {
      this.disconnect(new KeymasterTransportError("wallet_closed", "Keymaster wallet connection is closing"));
      return;
    }
    if (value.type === "revoked" && value.authorizationId === this.authorizationId) {
      const revokedError = new KeymasterProtocolError("authorization_expired", "Application connection authorization was revoked");
      this.disconnect(revokedError);
      return;
    }
    if (value.type === "event") {
      // 只投递当前公开契约中的事件，避免已删除能力仍透传给 App。
      if (value.event !== "channel.message_received") return;
      try { if (!this.identityValue || value.bindingId !== this.bindingId || !sameNetworkIdentity(this.identityValue, validateNetworkIdentity(value.networkIdentity))) return; } catch { return; }
      try {
        this.options.onEvent?.(event.data as ProtocolEventMessage);
      } catch {
        // Consumer callbacks do not own the transport event loop.
      }
      return;
    }
    if (value.type !== "result" || typeof value.id !== "string" || typeof value.ok !== "boolean") return;

    const result = event.data as ProtocolResultMessage;
    const pending = this.pending.get(result.id);
    if (!pending) return;
    this.deletePending(result.id);
    if (!result.ok) {
      // 关联到本请求的错误帧也必须校验，避免清掉计时器后因空 error 抛异常而永久悬挂。
      if (!result.error || typeof result.error.code !== "string" || !result.error.code || typeof result.error.message !== "string") {
        pending.reject(new KeymasterProtocolError("invalid_request", "Malformed Keymaster error result"));
        return;
      }
      if (result.error.code === "connection_expired" || result.error.code === "authorization_expired") this.disconnect(new KeymasterProtocolError(result.error.code, result.error.message));
      if (pending.method === "connect.login" || pending.method === "connect.launch") this.disconnect(new KeymasterProtocolError(result.error.code, result.error.message));
      pending.reject(new KeymasterProtocolError(result.error.code, result.error.message));
      return;
    }
    try {
      const identity = validateNetworkIdentity(value.networkIdentity);
      if (["connect.login", "connect.launch"].includes(pending.method)) {
        const connected = result.result as { networkIdentity: unknown; authorizationId: string };
        if (!sameNetworkIdentity(identity, validateNetworkIdentity(connected.networkIdentity)) || typeof value.bindingId !== "string" || !value.bindingId || typeof connected.authorizationId !== "string" || !connected.authorizationId) throw new Error("Invalid connection identity or binding");
        this.aiTools.clear(new Error("Connection binding replaced; register tools again"));
        this.identityValue = Object.freeze({ ...identity });
        this.authorizationId = connected.authorizationId;
        this.bindingId = value.bindingId;
        this.setState("connected");
      } else if (!this.identityValue || value.bindingId !== this.bindingId || !sameNetworkIdentity(this.identityValue, identity)) {
        throw new Error("Keymaster connection identity mismatch");
      }
      if (pending.method === "connect.logout") {
        this.disconnect(new KeymasterTransportError("client_closed", "Logged out"));
      }
      pending.resolve(result.result);
    } catch (error) {
      pending.reject(new KeymasterProtocolError("invalid_request", errorMessage(error, "Invalid connection result")));
    }
  };

  private isConnected(): boolean {
    return this.stateValue === "connected" && !!this.sessionWindow && !isWindowClosed(this.sessionWindow);
  }

  private installListener(): void {
    if (this.listenerInstalled) return;
    this.environment.addMessageListener(this.handleMessage);
    this.environment.addPageHideListener?.(this.handlePageHide);
    this.listenerInstalled = true;
  }

  private finishReady(): void {
    if (!this.readyPromise) return;
    if (this.readyTimer !== null) this.environment.clearTimeout(this.readyTimer);
    this.readyTimer = null;
    this.readyResolve?.();
    this.readyPromise = null;
    this.readyResolve = null;
    this.readyReject = null;
    this.setState("connected");
  }

  private failReady(reason: unknown): void {
    if (this.readyTimer !== null) this.environment.clearTimeout(this.readyTimer);
    this.readyTimer = null;
    this.readyReject?.(reason);
    this.readyPromise = null;
    this.readyResolve = null;
    this.readyReject = null;
  }

  /** 仅清理本地运行态，页签关闭不发送握手或等待回复。 */
  private readonly handlePageHide = (): void => {
    if (this.sessionWindow && this.bindingId) {
      try { this.sessionWindow.postMessage({ v: PROTOCOL_VERSION, type: "client_unloaded", bindingId: this.bindingId }, this.targetOrigin); } catch { /* Unload notification is best effort. */ }
    }
    this.disconnect(new KeymasterTransportError("client_closed", "Application page unloaded"));
  };

  private disconnect(reason: unknown): void {
    this.aiTools.clear(reason);
    this.identityValue = null;
    this.bindingId = null;
    this.rejectAll(reason);
    this.failReady(reason);
    this.stopClosePolling();
    this.sessionWindow = null;
    this.authorizationId = null;
    if (this.listenerInstalled) {
      this.environment.removeMessageListener(this.handleMessage);
      this.environment.removePageHideListener?.(this.handlePageHide);
      this.listenerInstalled = false;
    }
    this.setState("disconnected");
  }

  private startClosePolling(): void {
    this.stopClosePolling();
    this.closePoller = this.environment.setInterval(() => {
      if (this.sessionWindow && isWindowClosed(this.sessionWindow)) {
        this.disconnect(new KeymasterTransportError("wallet_closed", "Wallet window is closed"));
      }
    }, this.options.closePollMs);
  }

  private stopClosePolling(): void {
    if (this.closePoller !== null) this.environment.clearInterval(this.closePoller);
    this.closePoller = null;
  }

  private rejectAll(reason: unknown): void {
    for (const [id, pending] of this.pending) {
      this.deletePending(id);
      pending.reject(reason);
    }
  }

  private deletePending(id: string): void {
    const pending = this.pending.get(id);
    if (!pending) return;
    this.environment.clearTimeout(pending.timer);
    if (pending.signal && pending.abortListener) {
      pending.signal.removeEventListener("abort", pending.abortListener);
    }
    this.pending.delete(id);
  }

  private postCancel(id: string): void {
    try {
      this.sessionWindow?.postMessage({ v: PROTOCOL_VERSION, type: "cancel", id, ...(this.bindingId ? { bindingId: this.bindingId } : {}) }, this.targetOrigin);
    } catch {
      // Protocol cancellation is best-effort.
    }
  }

  private setState(state: KeymasterConnectState): void {
    if (state === this.stateValue) return;
    this.stateValue = state;
    try {
      this.options.onStateChange?.(state);
    } catch {
      // Consumer callbacks cannot interrupt lifecycle transitions.
    }
  }
}

/** Creates a client without using `new`. */
export function createKeymasterConnect(options: KeymasterConnectOptions): KeymasterConnectClient {
  return new KeymasterConnectClient(options);
}

/** Creates the production environment adapter from the current browser window. */
export function createBrowserEnvironment(): KeymasterBrowserEnvironment {
  if (typeof window === "undefined") {
    throw new TypeError("keymaster-connect requires a browser Window or an explicit environment");
  }
  return {
    open: (url, target, features) => window.open(url, target, features),
    opener: () => window.opener,
    parent: () => window.parent !== window ? window.parent : null,
    addMessageListener: (listener) => window.addEventListener("message", listener),
    removeMessageListener: (listener) => window.removeEventListener("message", listener),
    setTimeout: (handler, timeoutMs) => window.setTimeout(handler, timeoutMs),
    clearTimeout: (timer) => window.clearTimeout(timer),
    setInterval: (handler, intervalMs) => window.setInterval(handler, intervalMs),
    clearInterval: (timer) => window.clearInterval(timer),
    addPageHideListener: listener => window.addEventListener("pagehide", listener),
    removePageHideListener: listener => window.removeEventListener("pagehide", listener),
    randomUUID: () => window.crypto.randomUUID()
  };
}

function normalizeHttpOrigin(input: string): string {
  const url = new URL(input);
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new TypeError("targetOrigin must use http or https");
  }
  return url.origin;
}

function positiveNumber(value: number, name: string): number {
  if (!Number.isFinite(value) || value <= 0) throw new TypeError(`${name} must be a positive number`);
  return value;
}

function isWindowClosed(value: Window): boolean {
  try {
    return value.closed === true;
  } catch {
    return true;
  }
}

function abortReason(signal: AbortSignal): unknown {
  return signal.reason ?? new DOMException("The operation was aborted", "AbortError");
}

function errorMessage(value: unknown, fallback: string): string {
  return value instanceof Error && value.message ? value.message : fallback;
}

/** 主动建连时附带当前入口的发布记录字符串（若有）；钱包仍解码验签并核对实际来源。 */
function withOwnPublicationRecord<P extends object>(params: P): P {
  const provided = (params as Record<string, unknown>).publicationProof;
  if (provided !== undefined) {
    if (typeof provided !== "string" || provided.length === 0) throw new TypeError("publicationProof must be a non-empty record string");
    return params;
  }
  const record = readOwnPublicationRecord();
  return record === null ? params : { ...params, publicationProof: record };
}
