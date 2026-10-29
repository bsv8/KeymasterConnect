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
  type ConnectResumeResult,
  type ConnectResumeParams,
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
  type P2pkhTransferParams,
  type P2pkhTransferResult,
  type PaymentPayParams,
  type PaymentPayResult,
  type PaymentStatusParams,
  type PaymentStatusResult,
  type PaymentChannelRegisterParams,
  type PaymentChannelRegisterResult,
  type ProtocolErrorCode,
  type ProtocolEventMessage,
  type ProtocolMethod,
  type ProtocolResultMessage,
  type StorageDeleteParams,
  type StorageDeleteResult,
  type StorageDirectoryParams,
  type StorageDirectoryResult,
  type StorageGetParams,
  type StorageGetResult,
  type StorageListParams,
  type StorageListResult,
  type StoragePutParams,
  type StoragePutResult,
} from "./protocol.js";

/** 应用只在钱包创建的跨源 iframe 内连接其父钱包。 */
export type KeymasterConnectMode = "appView";

/** Observable lifecycle of the browser transport. */
export type KeymasterConnectState = "idle" | "opening" | "connected" | "paused" | "disconnected";

/** Failures produced by the browser transport before a protocol result exists. */
export type KeymasterTransportErrorCode =
  | "wallet_closed"
  | "ready_timeout"
  | "request_timeout"
  | "send_failed"
  | "not_embedded"
  | "appview_session_lost"
  | "client_closed"
  | "unsupported_protocol"
  | "wallet_paused";

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
  parent(): Window | null;
  addMessageListener(listener: (event: MessageEvent) => void): void;
  removeMessageListener(listener: (event: MessageEvent) => void): void;
  setTimeout(handler: () => void, timeoutMs: number): number;
  clearTimeout(timer: number): void;
  setInterval(handler: () => void, intervalMs: number): number;
  clearInterval(timer: number): void;
  randomUUID(): string;
}

/** Configuration for {@link KeymasterConnectClient}. */
export interface KeymasterConnectOptions {
  /** Exact Keymaster deployment origin supplied by the host application. */
  targetOrigin: string;
  /** 钱包启动的 iframe 应用；独立页面不提供拉起钱包入口。 */
  mode?: KeymasterConnectMode;
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
 * const session = await keymaster.launch({ launchToken, appIdentity });
 * ```
 *
 * @groupDescription Connect
 * Create, restore, revoke, or launch a persistent Connect session.
 *
 * @groupDescription Identity
 * Read signed identity claims or sign an application intent.
 *
 * @groupDescription Cipher
 * Encrypt and decrypt origin-bound application data.
 *
 * @groupDescription Transfer
 * Request a controlled BSV transfer.
 *
 * @groupDescription Channel
 * Publish JSON content and manage exact-channel subscriptions. Incoming
 * messages arrive as `channel.message_received` events.
 *
 * @groupDescription Storage
 * Manage app-scoped directories and objects.
 *
 * @groupDescription Transport
 * Manage the Session Window and send lower-level protocol requests.
 */
export class KeymasterConnectClient {
  private identityValue: Readonly<NetworkIdentity> | null = null;
  private bindingId: string | null = null;

  /** Identity returned by the authenticated wallet, or null before establishment. */
  get networkIdentity(): Readonly<NetworkIdentity> | null { return this.identityValue; }
  private readonly targetOrigin: string;
  private readonly environment: KeymasterBrowserEnvironment;
  private readonly options: Required<Pick<KeymasterConnectOptions,
    "readyTimeoutMs" | "requestTimeoutMs" | "closePollMs">> & KeymasterConnectOptions;
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
  private authorizedIdentity: Readonly<NetworkIdentity> | null = null;
  private recoveryId: string | null = null;
  private recoveryWaiters = new Set<{ resolve(result: ConnectResumeResult): void; reject(error: unknown): void }>();

  constructor(options: KeymasterConnectOptions) {
    if ("networkIdentity" in options) throw new TypeError("networkIdentity option has been removed; read identity from the connection result");
    this.targetOrigin = normalizeHttpOrigin(options.targetOrigin);
    if (options.mode !== undefined && options.mode !== "appView") throw new TypeError("Connect apps must be launched inside the wallet");
    this.options = {
      ...options,
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
   * 绑定浏览器真实父页面，精确校验来源；独立页面直接失败，不打开钱包窗口。
   *
   * @group Transport
   */
  connect(): Promise<void> {
    return this.connectAppView();
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
    if (method === "connect.resume" && this.authorizationId) return this.continueConnection(options) as Promise<MethodResult<M>>;
    const establishing = ["connect.login", "connect.resume", "connect.launch"].includes(method);
    if (!establishing && this.stateValue === "paused") throw new KeymasterTransportError("wallet_paused", "Wallet connection is paused; old business requests are never replayed");
    if (establishing && this.pending.size) throw new TypeError("Cannot establish a connection while requests are pending");
    if (!establishing && !this.bindingId) throw new KeymasterProtocolError("invalid_request", "Login, resume or launch before making business requests");
    if ([...this.pending.values()].some(request => ["connect.login", "connect.resume", "connect.launch"].includes(request.method))) throw new TypeError("Connection establishment is already pending");
    await this.connect();
    if (establishing && this.pending.size) throw new TypeError("Cannot establish a connection while requests are pending");
    if ([...this.pending.values()].some(request => ["connect.login", "connect.resume", "connect.launch"].includes(request.method))) throw new TypeError("Connection establishment is already pending");
    if (options.signal?.aborted) throw abortReason(options.signal);

    const target = this.sessionWindow;
    if (!target || isWindowClosed(target)) {
      throw new KeymasterTransportError("wallet_closed", "Keymaster parent wallet is closed");
    }
    const requestId = options.requestId ?? this.environment.randomUUID();
    if (!requestId || this.pending.has(requestId)) {
      throw new TypeError("requestId must be non-empty and unique among pending requests");
    }
    const timeoutMs = positiveNumber(options.timeoutMs ?? this.options.requestTimeoutMs, "timeoutMs");

    return new Promise<MethodResult<M>>((resolve, reject) => {
      const timer = this.environment.setTimeout(() => {
        this.postCancel(requestId);
        this.deletePending(requestId);
        reject(new KeymasterTransportError("request_timeout", `Keymaster request timed out: ${method}`));
      }, timeoutMs);
      const abortListener = options.signal
        ? () => {
            this.postCancel(requestId);
            this.deletePending(requestId);
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
          params
        }, this.targetOrigin);
      } catch (cause) {
        this.deletePending(requestId);
        reject(new KeymasterTransportError("send_failed", errorMessage(cause, "Unable to send Keymaster request")));
      }
    });
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
   * Calls `connect.resume` to restore the unlock runtime for a persistent
   * session.
   *
   * @group Connect
   */
  resume(params: ConnectResumeParams = {}, options?: KeymasterRequestOptions): Promise<ConnectResumeResult> {
    return this.request("connect.resume", params, options);
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
  paymentStatus(params: PaymentStatusParams, options?: KeymasterRequestOptions): Promise<PaymentStatusResult> {
    return this.request("payment.status", params, options);
  }

  /**
   * @deprecated Connect v1 接收端拒绝旧转账方法，使用 paymentPay。
   * @group Transfer
   */
  p2pkhTransfer(params: P2pkhTransferParams, options?: KeymasterRequestOptions): Promise<P2pkhTransferResult> {
    return this.request("p2pkh.transfer", params, options);
  }

  /** 注册零额度渠道；用户在钱包设置额度后，付款携带返回的 channelId。 */
  registerPaymentChannel(params: PaymentChannelRegisterParams, options?: KeymasterRequestOptions): Promise<PaymentChannelRegisterResult> {
    return this.request("payment.channel.register", params, options);
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
   * Calls `storage.list` to list paths in the verified application's namespace.
   *
   * @group Storage
   */
  storageList(params: StorageListParams, options?: KeymasterRequestOptions): Promise<StorageListResult> {
    return this.request("storage.list", params, options);
  }

  /**
   * Calls `storage.directory.create` to create an app-scoped directory.
   *
   * @group Storage
   */
  storageDirectoryCreate(
    params: StorageDirectoryParams,
    options?: KeymasterRequestOptions
  ): Promise<StorageDirectoryResult> {
    return this.request("storage.directory.create", params, options);
  }

  /**
   * Calls `storage.directory.delete` to delete an app-scoped directory.
   *
   * @group Storage
   */
  storageDirectoryDelete(
    params: StorageDirectoryParams,
    options?: KeymasterRequestOptions
  ): Promise<StorageDirectoryResult> {
    return this.request("storage.directory.delete", params, options);
  }

  /**
   * Calls `storage.put` to write an app-scoped object.
   *
   * @group Storage
   */
  storagePut(params: StoragePutParams, options?: KeymasterRequestOptions): Promise<StoragePutResult> {
    return this.request("storage.put", params, options);
  }

  /**
   * Calls `storage.get` to read an app-scoped object.
   *
   * @group Storage
   */
  storageGet(params: StorageGetParams, options?: KeymasterRequestOptions): Promise<StorageGetResult> {
    return this.request("storage.get", params, options);
  }

  /**
   * Calls `storage.delete` to delete an app-scoped object.
   *
   * @group Storage
   */
  storageDelete(params: StorageDeleteParams, options?: KeymasterRequestOptions): Promise<StorageDeleteResult> {
    return this.request("storage.delete", params, options);
  }

  /**
   * Calls `msfile.stat` to query every enabled MSFile supplier for a seed
   * hash. The caller selects supplier/hash only; price policy stays inside
   * Keymaster.
   *
   * @group MSFile
   */
  msfileStat(params: MsFileStatParams, options?: KeymasterRequestOptions): Promise<MsFileStatResult> {
    return this.request("msfile.stat", params, options);
  }

  /**
   * Calls `msfile.seed.read` to buy and read a MasterSeed by hash. There is no
   * price parameter: Keymaster resolves the amount from its settings or asks
   * the user for approval when needed.
   *
   * @group MSFile
   */
  msfileReadSeed(params: MsFileSeedReadParams, options?: KeymasterRequestOptions): Promise<MsFileReadResult> {
    return this.request("msfile.seed.read", params, options);
  }

  /**
   * Calls `msfile.block.read` to buy and read a single file block by hash.
   * Like {@link msfileReadSeed}, no caller-supplied price is accepted.
   *
   * @group MSFile
   */
  msfileReadBlock(params: MsFileBlockReadParams, options?: KeymasterRequestOptions): Promise<MsFileReadResult> {
    return this.request("msfile.block.read", params, options);
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
    pending.reject(reason);
    return true;
  }

  /**
   * Tears down the local transport. This does not revoke persistent Connect
   * sessions; call {@link logout} before closing when revocation is required.
   *
   * @group Transport
   */
  close(): void {
    // 取消仍可取消的请求；钱包窗口不是客户端的资源，始终由用户自己关闭。
    for (const id of this.pending.keys()) this.postCancel(id);
    this.identityValue = null;
    this.bindingId = null;
    const error = new KeymasterTransportError("client_closed", "Keymaster client was closed");
    this.rejectAll(error);
    this.failReady(error);
    this.stopClosePolling();
    if (this.listenerInstalled) {
      this.environment.removeMessageListener(this.handleMessage);
      this.listenerInstalled = false;
    }
    if (!this.authorizationId) this.sessionWindow = null;
    this.recoveryId = null;
    this.finishRecovery(undefined, error);
    this.setState(this.authorizationId ? "paused" : "disconnected");
  }

  /** 恢复原父钱包连接；任何情况下都不另开窗口或重放旧业务。 */
  private continueConnection(options: KeymasterRequestOptions): Promise<ConnectResumeResult> {
    if (this.pending.size) return Promise.reject(new TypeError("Cannot resume while business requests are pending"));
    this.installListener();
    const parent = this.environment.parent();
    if (!parent || isWindowClosed(parent)) return Promise.reject(new KeymasterTransportError("appview_session_lost", "No wallet parent is available; relaunch from the wallet"));
    this.sessionWindow = parent;
    this.pause(new KeymasterTransportError("wallet_paused", "Re-establishing the original wallet connection"));
    this.startClosePolling();
    return new Promise((resolve, reject) => {
      const finish = (error?: unknown, result?: ConnectResumeResult) => {
        this.environment.clearTimeout(timer);
        options.signal?.removeEventListener("abort", aborted);
        this.recoveryWaiters.delete(waiter);
        if (error) reject(error); else resolve(result!);
      };
      const waiter = { resolve: (result: ConnectResumeResult) => finish(undefined, result), reject: (error: unknown) => finish(error) };
      const aborted = () => finish(abortReason(options.signal!));
      const timer = this.environment.setTimeout(() => finish(new KeymasterTransportError("request_timeout", "Timed out restoring wallet connection")), positiveNumber(options.timeoutMs ?? this.options.readyTimeoutMs, "timeoutMs"));
      this.recoveryWaiters.add(waiter);
      options.signal?.addEventListener("abort", aborted, { once: true });
      this.sendRecovery();
    });
  }

  private connectAppView(): Promise<void> {
    if (this.isConnected()) return Promise.resolve();
    const parent = this.environment.parent();
    if (!parent || isWindowClosed(parent)) {
      const code: KeymasterTransportErrorCode = this.stateValue === "idle" ? "not_embedded" : "appview_session_lost";
      this.setState("disconnected");
      return Promise.reject(new KeymasterTransportError(
        code,
        "No live wallet parent is available; launch the app from Keymaster"
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

    if (value.type === "ready") return;
    if (value.type === "closing") {
      if (this.authorizationId) this.pause(new KeymasterTransportError("wallet_paused", "Wallet runtime is unavailable"));
      else this.disconnect(new KeymasterTransportError("wallet_closed", "Keymaster wallet connection is closing"));
      return;
    }
    if (value.type === "revoked" && value.authorizationId === this.authorizationId) {
      this.authorizationId = null; this.authorizedIdentity = null; this.recoveryId = null;
      this.finishRecovery(undefined, new KeymasterProtocolError("connection_expired", "Application connection authorization was revoked"));
      this.disconnect(new KeymasterProtocolError("connection_expired", "Application connection authorization was revoked"));
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
    if (this.authorizationId && result.id === this.recoveryId) {
      if (!result.ok) { this.pause(new KeymasterProtocolError(result.error.code, result.error.message)); return; }
      try {
        const identity = validateNetworkIdentity(value.networkIdentity);
        const restored = result.result as ConnectResumeResult;
        if (!this.authorizedIdentity || !sameNetworkIdentity(identity, this.authorizedIdentity) || !sameNetworkIdentity(identity, validateNetworkIdentity(restored.networkIdentity))
          || restored.authorizationId !== this.authorizationId || typeof value.bindingId !== "string" || !value.bindingId) throw new Error("Recovery must retain the original wallet and authorization");
        if (this.bindingId !== value.bindingId) this.pause(new KeymasterTransportError("wallet_paused", "Wallet runtime was replaced"));
        this.identityValue = Object.freeze({ ...identity }); this.bindingId = value.bindingId; this.recoveryId = null;
        this.setState("connected"); this.finishRecovery(restored);
      } catch (error) { this.pause(error); this.finishRecovery(undefined, error); }
      return;
    }
    const pending = this.pending.get(result.id);
    if (!pending) return;
    this.deletePending(result.id);
    if (!result.ok) {
      // 关联到本请求的错误帧也必须校验，避免清掉计时器后因空 error 抛异常而永久悬挂。
      if (!result.error || typeof result.error.code !== "string" || !result.error.code || typeof result.error.message !== "string") {
        pending.reject(new KeymasterProtocolError("invalid_request", "Malformed Keymaster error result"));
        return;
      }
      if (result.error.code === "connection_expired") { if (this.authorizationId) this.pause(new KeymasterProtocolError(result.error.code, result.error.message)); else { this.identityValue = null; this.bindingId = null; } }
      pending.reject(new KeymasterProtocolError(result.error.code, result.error.message));
      return;
    }
    try {
      const identity = validateNetworkIdentity(value.networkIdentity);
      if (["connect.login", "connect.resume", "connect.launch"].includes(pending.method)) {
        const connected = result.result as { networkIdentity: unknown; authorizationId: string };
        if (!sameNetworkIdentity(identity, validateNetworkIdentity(connected.networkIdentity)) || typeof value.bindingId !== "string" || !value.bindingId || typeof connected.authorizationId !== "string" || !connected.authorizationId) throw new Error("Invalid connection identity or binding");
        this.identityValue = Object.freeze({ ...identity });
        this.authorizedIdentity = this.identityValue; this.authorizationId = connected.authorizationId; this.recoveryId = null;
        this.bindingId = value.bindingId;
      } else if (!this.identityValue || value.bindingId !== this.bindingId || !sameNetworkIdentity(this.identityValue, identity)) {
        throw new Error("Keymaster connection identity mismatch");
      }
      if (pending.method === "connect.logout") { this.identityValue = null; this.bindingId = null; this.authorizationId = null; this.authorizedIdentity = null; this.recoveryId = null; }
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

  private disconnect(reason: unknown): void {
    for (const id of this.pending.keys()) this.postCancel(id);
    this.identityValue = null;
    this.bindingId = null;
    this.rejectAll(reason);
    this.failReady(reason);
    this.stopClosePolling();
    this.sessionWindow = null;
    this.setState("disconnected");
  }

  /** 暂停仅撤销瞬时绑定和旧请求，持久授权引用及原身份留作恢复校验。 */
  private pause(reason: unknown): void {
    this.identityValue = null; this.bindingId = null;
    this.rejectAll(reason); this.failReady(reason);
    this.setState("paused");
  }

  private sendRecovery(): void {
    if (!this.authorizationId || !this.sessionWindow || isWindowClosed(this.sessionWindow)) return;
    this.recoveryId ??= this.environment.randomUUID();
    try { this.sessionWindow.postMessage({ v: PROTOCOL_VERSION, type: "reconnect", id: this.recoveryId, authorizationId: this.authorizationId, ...(this.bindingId ? { bindingId: this.bindingId } : {}) }, this.targetOrigin); }
    catch (error) { this.pause(error); }
  }

  private finishRecovery(result?: ConnectResumeResult, error?: unknown): void {
    for (const waiter of [...this.recoveryWaiters]) { if (error) waiter.reject(error); else if (result) waiter.resolve(result); }
  }

  private startClosePolling(): void {
    this.stopClosePolling();
    this.closePoller = this.environment.setInterval(() => {
      if (this.sessionWindow && isWindowClosed(this.sessionWindow)) {
        if (this.authorizationId) { if (this.stateValue !== "paused") this.pause(new KeymasterTransportError("wallet_paused", "Wallet window is closed")); }
        else this.disconnect(new KeymasterTransportError("wallet_closed", "Keymaster parent wallet was closed"));
      } else this.sendRecovery();
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
    parent: () => window.parent !== window ? window.parent : null,
    addMessageListener: (listener) => window.addEventListener("message", listener),
    removeMessageListener: (listener) => window.removeEventListener("message", listener),
    setTimeout: (handler, timeoutMs) => window.setTimeout(handler, timeoutMs),
    clearTimeout: (timer) => window.clearTimeout(timer),
    setInterval: (handler, intervalMs) => window.setInterval(handler, intervalMs),
    clearInterval: (timer) => window.clearInterval(timer),
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
