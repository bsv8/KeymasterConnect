import { AiToolClient } from "./toolClient.js";
import type { AiTool, AiToolsRegistered } from "./tools.js";
import {
  clearConnectionRecovery,
  loadConnectionRecoveryRecord,
  resolveRecoveryStorage,
  saveConnectionRecoveryRecord,
  type ConnectionRecoveryStorage,
} from "./recovery.js";
import {
  PROTOCOL_VERSION, PROTOCOL_METHODS,
  validateNetworkIdentity, sameNetworkIdentity, type NetworkIdentity,
  type AppIdentityProofV1,
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
  type PaymentPayParams,
  type PaymentPayResult,
  type PaymentStatusParams,
  type PaymentStatusResult,
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

/** iframe：钱包内嵌；appView：钱包弹出 App；popup：App 主动打开钱包。 */
export type KeymasterConnectMode = "iframe" | "appView" | "popup";

/** Observable lifecycle of the browser transport. */
export type KeymasterConnectState = "idle" | "opening" | "connected" | "paused" | "disconnected";

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
  /** 可替换的刷新恢复存储；默认访问 Demo origin 下的 sessionStorage，不降级到 localStorage。 */
  recoveryStorage?: ConnectionRecoveryStorage;
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
 * @groupDescription Payment
 * Submit business outputs and query payment status.
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
  /** 最近一次持久化失败的原因；成功后清零。登录成功不受写入失败影响。 */
  get recoverySaveError(): string | null { return this.recoverySaveErrorValue; }
  /** 刷新恢复存储是否可用；不可用时仍可登录，但刷新后需重新登录。 */
  get recoveryStorageAvailable(): boolean { return this.recoveryStorage !== null; }
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
  private authorizedIdentity: Readonly<NetworkIdentity> | null = null;
  private recoveryId: string | null = null;
  private readonly recoveryStorage: ConnectionRecoveryStorage | null;
  private recoverySaveErrorValue: string | null = null;
  /** 显式恢复期间暂停后台心跳，保证本次尝试使用同一份 proof；结束（成功/失败/取消/超时）后恢复。 */
  private explicitRecoveryActive = false;
  private explicitRecoveryProof: AppIdentityProofV1 | undefined = undefined;
  /** 内存授权是否已验证：login/launch/恢复成功置 true；仅从存储装载的待验证凭据为 false。 */
  private authorizationVerified = false;
  /** 当前传输窗口是否已可信就绪（收到过匹配来源与窗口的 ready）；新开窗口后重置，存在≠就绪。 */
  private sessionWindowReady = false;
  /** 新 popup 首发前等待可信窗口 ready 的一次性继续函数；超时/结束时清空。 */
  private recoveryReadyContinue: (() => void) | null = null;
  private recoveryWaiters = new Set<{ resolve(result: ConnectResumeResult): void; reject(error: unknown): void }>();

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
    this.recoveryStorage = resolveRecoveryStorage(options.recoveryStorage);
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
   * 只建立传输，不恢复授权：iframe / appView 绑定真实 parent / opener；
   * popup 打开完整钱包等待 ready。刷新后的授权恢复请使用 `resume()`，
   * 它会先装载本地恢复记录再复用 `continueConnection()`；`connect()` 本身
   * 不读取恢复记录、不自动恢复。
   *
   * @group Transport
   */
  connect(): Promise<void> {
    if (this.explicitRecoveryActive) return Promise.reject(new TypeError("Connection recovery is already in progress"));
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
    if (method === "connect.resume" && this.authorizationId) {
      const resumeProof = (params as ConnectResumeParams).appIdentity as AppIdentityProofV1 | undefined;
      return this.continueConnection(options, resumeProof) as Promise<MethodResult<M>>;
    }
    const establishing = ["connect.login", "connect.resume", "connect.launch"].includes(method);
    if (!establishing && this.stateValue === "paused") throw new KeymasterTransportError("wallet_paused", "Wallet connection is paused; old business requests are never replayed");
    if (establishing && this.pending.size) throw new TypeError("Cannot establish a connection while requests are pending");
    // 显式恢复同样占用唯一的建立连接位：login/launch/普通 resume 不得与之并发。
    if (establishing && this.explicitRecoveryActive) throw new TypeError("Connection recovery is already in progress");
    if (!establishing && !this.bindingId) throw new KeymasterProtocolError("invalid_request", "Login, resume or launch before making business requests");
    if ([...this.pending.values()].some(request => ["connect.login", "connect.resume", "connect.launch"].includes(request.method))) throw new TypeError("Connection establishment is already pending");
    await this.connect();
    if (establishing && this.pending.size) throw new TypeError("Cannot establish a connection while requests are pending");
    if ([...this.pending.values()].some(request => ["connect.login", "connect.resume", "connect.launch"].includes(request.method))) throw new TypeError("Connection establishment is already pending");
    if (establishing && this.explicitRecoveryActive) throw new TypeError("Connection recovery is already in progress");
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
   * 刷新恢复时只把保存的凭据和预期身份载入待恢复上下文，不直接置为已登录；
   * 钱包验证成功、结果身份一致并取得新 binding 后才开放业务调用。
   * 无可用凭据时直接拒绝并提示重新登录，不回退到无凭据的重建默认授权。
   * 恢复请求携带调用方当前入口的 `appIdentity`（如有），不静默丢弃。
   *
   * @group Connect
   */
  resume(params: ConnectResumeParams = {}, options?: KeymasterRequestOptions): Promise<ConnectResumeResult> {
    if (options?.signal?.aborted) return Promise.reject(abortReason(options.signal));
    // 互斥必须在装载凭据或修改状态之前：并发恢复直接拒绝，不触碰本次之外的任何状态。
    if (this.explicitRecoveryActive) return Promise.reject(new TypeError("Connection recovery is already in progress"));
    if (this.authorizationId && this.authorizationVerified) {
      return this.request("connect.resume", params, options);
    }
    const stored = loadConnectionRecoveryRecord({
      recoveryStorage: this.recoveryStorage ?? undefined,
      targetOrigin: this.targetOrigin,
      mode: this.mode,
    });
    if (stored) {
      this.authorizationId = stored.authorizationId;
      this.authorizedIdentity = Object.freeze({ ...stored.networkIdentity });
      this.authorizationVerified = false;
    } else if (!this.authorizationId) {
      return Promise.reject(new KeymasterTransportError("client_closed", "No saved Keymaster recovery record for this origin and mode; login again"));
    }
    // 存储为空但内存有未验证凭据时，用内存凭据尝试一次；失败照常清理。
    return this.continueConnection(options ?? {}, params.appIdentity);
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
   * 可选加密写入：向钱包提交明文，钱包以当前钱包密钥和 App 公钥隔离后加密保存。
   * 路径、条件创建语义与 storagePut 相同，size 返回明文字节数；不会返回加密密钥。
   * @group Storage
   */
  storagePutEncrypted(params: StoragePutParams, options?: KeymasterRequestOptions): Promise<StoragePutResult> {
    return this.request("storage.encrypted.put", params, options);
  }

  /**
   * 可选加密读取：仅同一钱包能解密；offset/length 作用于明文，ifMatch 仍比较远端版本。
   * 明文对象、错误格式、篡改或密钥不匹配均失败，不自动回退为普通读取。
   * @group Storage
   */
  storageGetEncrypted(params: StorageGetParams, options?: KeymasterRequestOptions): Promise<StorageGetResult> {
    return this.request("storage.encrypted.get", params, options);
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
   * 只结束运行连接，保留刷新恢复材料：`close()`、页面卸载和运行失效都不删除
   * 本地恢复记录；`logout` 成功、明确授权失效或用户主动清除才删除。
   *
   * @group Transport
   */
  close(): void {
    if (this.bindingId) {
      try { this.sessionWindow?.postMessage({ v: PROTOCOL_VERSION, type: "tools.register", bindingId: this.bindingId, id: this.environment.randomUUID(), tools: [] }, this.targetOrigin); } catch { /* Best effort; wallet lifecycle also revokes tools. */ }
    }
    this.aiTools.clear(new Error("Connect client closed"));
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
    this.explicitRecoveryActive = false;
    this.explicitRecoveryProof = undefined;
    this.recoveryReadyContinue = null;
    this.finishRecovery(undefined, error);
    this.setState(this.authorizationId ? "paused" : "disconnected");
  }

  /** 主动恢复可由 popup 重新打开钱包；后台恢复从不打开窗口或重放业务。 */
  private continueConnection(options: KeymasterRequestOptions, appIdentity?: AppIdentityProofV1): Promise<ConnectResumeResult> {
    if (options.signal?.aborted) return Promise.reject(abortReason(options.signal));
    // 互斥：已在进行的显式恢复未结束前，不接受第二次恢复（经由 resume 或 request 直调）。
    if (this.explicitRecoveryActive) return Promise.reject(new TypeError("Connection recovery is already in progress"));
    if (this.pending.size) return Promise.reject(new TypeError("Cannot resume while business requests are pending"));
    this.installListener();
    // 新 popup 尚未 ready：钱包监听未安装，立即首发必丢。窗口存在≠就绪，
    // 以 sessionWindowReady 独立记录；未就绪一律等可信窗口 ready 后再发固定 proof。
    let awaitReady = false;
    if (this.mode === "popup") {
      if (!this.sessionWindow || isWindowClosed(this.sessionWindow)) {
        const url = new URL(this.options.popupPath, `${this.targetOrigin}/`);
        if (url.origin !== this.targetOrigin) return Promise.reject(new TypeError("popupPath must resolve inside targetOrigin"));
        this.sessionWindow = this.environment.open(url.href, "_blank", "");
        if (!this.sessionWindow) return Promise.reject(new KeymasterTransportError("popup_blocked", "Keymaster wallet window was blocked"));
        this.sessionWindowReady = false;
        awaitReady = true;
      } else if (!this.sessionWindowReady) {
        awaitReady = true;
      }
    } else {
      const launcher = this.mode === "iframe" ? this.environment.parent() : this.environment.opener();
      if (!launcher || isWindowClosed(launcher)) return Promise.reject(new KeymasterTransportError("appview_session_lost", "Wallet launcher unavailable; relaunch from the wallet"));
      this.sessionWindow = launcher;
    }
    // 显式恢复开始：暂停后台心跳并固定本次 proof；结束（成功/失败/取消/超时）后恢复。
    // 清理依据凭据是否已验证，而非本次是否读存储：未验证凭据失败一律清内存
    // （防无 proof 心跳旁路），存储保留供用户重试；已验证授权失败则保留。
    const wasVerified = this.authorizationVerified;
    this.explicitRecoveryActive = true;
    this.explicitRecoveryProof = appIdentity;
    const endExplicitAttempt = (failed: boolean) => {
      this.explicitRecoveryActive = false;
      this.explicitRecoveryProof = undefined;
      this.recoveryReadyContinue = null;
      if (failed && !wasVerified && this.authorizationId) {
        this.authorizationId = null;
        this.authorizedIdentity = null;
        this.recoveryId = null;
      }
    };
    this.pause(new KeymasterTransportError("wallet_paused", "Re-establishing the original wallet connection"));
    this.startClosePolling();
    return new Promise((resolve, reject) => {
      const finish = (error?: unknown, result?: ConnectResumeResult) => {
        this.environment.clearTimeout(timer);
        options.signal?.removeEventListener("abort", aborted);
        this.recoveryWaiters.delete(waiter);
        endExplicitAttempt(!!error);
        if (error) reject(error); else resolve(result!);
      };
      const waiter = { resolve: (result: ConnectResumeResult) => finish(undefined, result), reject: (error: unknown) => finish(error) };
      const aborted = () => finish(abortReason(options.signal!));
      const timer = this.environment.setTimeout(() => finish(new KeymasterTransportError("request_timeout", "Timed out restoring wallet connection")), positiveNumber(options.timeoutMs ?? this.options.readyTimeoutMs, "timeoutMs"));
      this.recoveryWaiters.add(waiter);
      options.signal?.addEventListener("abort", aborted, { once: true });
      if (awaitReady) {
        // 首发推迟到可信窗口 ready；超时/取消/结束由统一 finish 收口。
        this.recoveryReadyContinue = () => this.sendRecovery(this.explicitRecoveryProof);
      } else {
        this.sendRecovery(this.explicitRecoveryProof);
      }
    });
  }

  private connectPopup(): Promise<void> {
    if (this.isConnected()) return Promise.resolve();
    if (this.readyPromise) return this.readyPromise;
    const url = new URL(this.options.popupPath, `${this.targetOrigin}/`);
    if (url.origin !== this.targetOrigin) return Promise.reject(new TypeError("popupPath must resolve inside targetOrigin"));
    this.installListener();
    this.setState("opening");
    this.sessionWindow = this.environment.open(url.href, "_blank", "");
    if (!this.sessionWindow) {
      this.setState("disconnected");
      return Promise.reject(new KeymasterTransportError("popup_blocked", "Keymaster wallet window was blocked"));
    }
    this.sessionWindowReady = false;
    this.startClosePolling();
    this.readyPromise = new Promise<void>((resolve, reject) => {
      this.readyResolve = resolve;
      this.readyReject = reject;
      this.readyTimer = this.environment.setTimeout(() => this.disconnect(new KeymasterTransportError("ready_timeout", "Timed out waiting for the wallet to initialize or unlock")), this.options.readyTimeoutMs);
    });
    return this.readyPromise;
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
      // 可信窗口就绪：独立记录就绪态（存在≠就绪），并触发等待中的显式恢复首发。
      this.sessionWindowReady = true;
      if (this.mode === "popup" && this.readyPromise) this.finishReady();
      // 新 popup 的显式恢复首发推迟到可信窗口 ready 后，避免首包丢失。
      if (this.explicitRecoveryActive && this.recoveryReadyContinue) {
        const send = this.recoveryReadyContinue;
        this.recoveryReadyContinue = null;
        send();
      }
      return;
    }
    if (value.type === "closing") {
      if (this.authorizationId) this.pause(new KeymasterTransportError("wallet_paused", "Wallet runtime is unavailable"));
      else this.disconnect(new KeymasterTransportError("wallet_closed", "Keymaster wallet connection is closing"));
      return;
    }
    if (value.type === "revoked" && value.authorizationId === this.authorizationId) {
      const revokedId = this.authorizationId;
      this.authorizationId = null; this.authorizedIdentity = null; this.authorizationVerified = false; this.recoveryId = null;
      this.dropRecoveryRecord(revokedId);
      const revokedError = new KeymasterProtocolError("authorization_expired", "Application connection authorization was revoked");
      this.finishRecovery(undefined, revokedError);
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
    if (this.authorizationId && result.id === this.recoveryId) {
      if (!result.ok) {
        // connection_expired 只表达运行连接、binding 或世代失效，保留恢复记录；
        // 只有钱包确认凭据已不存在/已撤销/不再有效时返回 authorization_expired，才清除。
        // 超时、窗口关闭、proof 校验失败及身份不匹配均保留记录，不自动重试。
        const code = result.error?.code;
        const message = result.error?.message ?? "Failed to restore wallet connection";
        if (code === "authorization_expired") {
          const expiredId = this.authorizationId;
          this.authorizationId = null; this.authorizedIdentity = null; this.authorizationVerified = false; this.recoveryId = null;
          this.dropRecoveryRecord(expiredId);
          const expired = new KeymasterProtocolError(code, message);
          this.finishRecovery(undefined, expired);
          this.disconnect(expired);
          return;
        }
        const failure = new KeymasterProtocolError((code as ProtocolErrorCode) || "connection_expired", message);
        this.pause(failure);
        this.recoveryId = null;
        this.finishRecovery(undefined, failure);
        return;
      }
      try {
        const identity = validateNetworkIdentity(value.networkIdentity);
        const restored = result.result as ConnectResumeResult;
        if (!this.authorizedIdentity || !sameNetworkIdentity(identity, this.authorizedIdentity) || !sameNetworkIdentity(identity, validateNetworkIdentity(restored.networkIdentity))
          || restored.authorizationId !== this.authorizationId || typeof value.bindingId !== "string" || !value.bindingId) throw new Error("Recovery must retain the original wallet and authorization");
        if (this.bindingId !== value.bindingId) this.pause(new KeymasterTransportError("wallet_paused", "Wallet runtime was replaced"));
        this.identityValue = Object.freeze({ ...identity }); this.bindingId = value.bindingId; this.recoveryId = null;
        this.authorizationVerified = true;
        this.setState("connected");
        // 恢复成功后校验原身份、原授权并更新记录；写入失败不影响已成功的恢复。
        this.persistRecoveryRecord(restored.authorizationId, identity);
        this.finishRecovery(restored);
      } catch (error) { this.pause(error); this.recoveryId = null; this.finishRecovery(undefined, error); }
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
      // connection_expired 仅表达运行连接失效，保留恢复记录；authorization_expired
      // 仅在恢复链路中触发清除，普通业务失败不擅自删除本地凭据。
      if (result.error.code === "connection_expired" || result.error.code === "authorization_expired") { if (this.authorizationId) this.pause(new KeymasterProtocolError(result.error.code, result.error.message)); else { this.identityValue = null; this.bindingId = null; } }
      pending.reject(new KeymasterProtocolError(result.error.code, result.error.message));
      return;
    }
    try {
      const identity = validateNetworkIdentity(value.networkIdentity);
      if (["connect.login", "connect.resume", "connect.launch"].includes(pending.method)) {
        const connected = result.result as { networkIdentity: unknown; authorizationId: string };
        if (!sameNetworkIdentity(identity, validateNetworkIdentity(connected.networkIdentity)) || typeof value.bindingId !== "string" || !value.bindingId || typeof connected.authorizationId !== "string" || !connected.authorizationId) throw new Error("Invalid connection identity or binding");
        this.aiTools.clear(new Error("Connection binding replaced; register tools again"));
        this.identityValue = Object.freeze({ ...identity });
        this.authorizedIdentity = this.identityValue; this.authorizationId = connected.authorizationId; this.authorizationVerified = true; this.recoveryId = null;
        this.bindingId = value.bindingId;
        // login/launch/resume 成功保存新记录；存储写入失败不影响已成功的登录。
        this.persistRecoveryRecord(connected.authorizationId, identity);
      } else if (!this.identityValue || value.bindingId !== this.bindingId || !sameNetworkIdentity(this.identityValue, identity)) {
        throw new Error("Keymaster connection identity mismatch");
      }
      if (pending.method === "connect.logout") {
        const logoutId = this.authorizationId;
        this.aiTools.clear(new Error("Logged out")); this.identityValue = null; this.bindingId = null; this.authorizationId = null; this.authorizedIdentity = null; this.authorizationVerified = false; this.recoveryId = null;
        // logout 成功清除本地恢复记录；用户主动清除同样只删本地材料，不宣称撤销。
        this.dropRecoveryRecord(logoutId);
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
    this.aiTools.clear(reason);
    for (const id of this.pending.keys()) this.postCancel(id);
    this.identityValue = null;
    this.bindingId = null;
    this.rejectAll(reason);
    this.failReady(reason);
    this.stopClosePolling();
    this.sessionWindow = null;
    this.sessionWindowReady = false;
    this.explicitRecoveryActive = false;
    this.explicitRecoveryProof = undefined;
    this.recoveryReadyContinue = null;
    this.setState("disconnected");
  }

  /** 暂停仅撤销瞬时绑定和旧请求，持久授权引用及原身份留作恢复校验。 */
  private pause(reason: unknown): void {
    this.aiTools.clear(reason);
    this.identityValue = null; this.bindingId = null;
    this.rejectAll(reason); this.failReady(reason);
    this.setState("paused");
  }

  /** 保存最近成功连接的恢复记录；写入失败只记录原因，不影响已成功的登录。 */
  private persistRecoveryRecord(authorizationId: string, identity: Readonly<NetworkIdentity>): void {
    if (!this.recoveryStorage) {
      this.recoverySaveErrorValue = "Recovery storage is unavailable; refresh will require re-login";
      return;
    }
    try {
      saveConnectionRecoveryRecord(this.recoveryStorage, {
        version: 1,
        targetOrigin: this.targetOrigin,
        mode: this.mode,
        authorizationId,
        networkIdentity: { ...identity },
      });
      this.recoverySaveErrorValue = null;
    } catch (error) {
      this.recoverySaveErrorValue = errorMessage(error, "Failed to persist recovery record; refresh will require re-login");
    }
  }

  /** 按目标与授权核对后清除本地恢复记录；旧实例迟到结果不得删除新记录。 */
  private dropRecoveryRecord(authorizationId?: string | null): void {
    try {
      clearConnectionRecovery({
        recoveryStorage: this.recoveryStorage ?? undefined,
        targetOrigin: this.targetOrigin,
        ...(authorizationId ? { authorizationId } : {}),
      });
    } catch {
      // 清除失败保留原记录，由下次明确失效再处理。
    }
  }

  private sendRecovery(appIdentity?: AppIdentityProofV1): void {
    if (!this.authorizationId || !this.sessionWindow || isWindowClosed(this.sessionWindow)) return;
    // 显式建立连接期间不发恢复心跳：旧授权的失效结果不能打断正在等待审批的
    // login/resume/launch；建立完成后心跳以新授权恢复。
    if (this.stateValue === "opening") return;
    if ([...this.pending.values()].some(request => ["connect.login", "connect.resume", "connect.launch"].includes(request.method))) return;
    this.recoveryId ??= this.environment.randomUUID();
    try { this.sessionWindow.postMessage({ v: PROTOCOL_VERSION, type: "reconnect", id: this.recoveryId, authorizationId: this.authorizationId, ...(this.bindingId ? { bindingId: this.bindingId } : {}), ...(appIdentity ? { appIdentity } : {}) }, this.targetOrigin); }
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
      } else if (!this.explicitRecoveryActive) this.sendRecovery();
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
