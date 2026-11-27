/** Connect v1 公开契约。独立于钱包内部执行 DTO、能力框架和持久化。 */
export type { AiToolSchema, AiToolDefinition, AiToolsRegistered, AiToolMessage } from "./tools.js";

/** 身份网络在创建/导入时确定；公钥相同也不能跨网复用业务身份。 */
export type BsvNetwork = "main" | "test";

export interface NetworkIdentity {
    readonly bsvNetwork: BsvNetwork;
    readonly publicKeyHex: string;
}

export function validateBsvNetwork(value: unknown): BsvNetwork {
    if (value !== "main" && value !== "test")
        throw new TypeError("BSV network must be main or test");
    return value;
}

export function validateNetworkIdentity(value: unknown): NetworkIdentity {
    if (!value || typeof value !== "object" || Array.isArray(value))
        throw new TypeError("Network identity is invalid");
    const input = value as Record<string, unknown>;
    if (typeof input.publicKeyHex !== "string" || !/^(02|03)[0-9a-f]{64}$/iu.test(input.publicKeyHex))
        throw new TypeError("Network identity public key is invalid");
    return Object.freeze({ bsvNetwork: validateBsvNetwork(input.bsvNetwork), publicKeyHex: input.publicKeyHex.toLowerCase() });
}

export function sameNetworkIdentity(left: NetworkIdentity, right: NetworkIdentity): boolean {
    return left.bsvNetwork === right.bsvNetwork && left.publicKeyHex.toLowerCase() === right.publicKeyHex.toLowerCase();
}

//
// 说明：Channel 是唯一的消息/发布抽象。这里不暴露 Supplier、SSP Wire、私钥、
// 付款信息或远端历史；这些都属于 Coordinator 和 SatSubscription 内部。
/** ChannelProtocol/SSP 共用的递归 JSON 值。 */
export type JSONValue = null | boolean | number | string | JSONValue[] | {
    [key: string]: JSONValue;
};

export interface ChannelPublishParams {
    /** 要发布到的 SSP 精确频道；不允许通配符。 */
    channel: string;
    /** App 自己定义的 JSON 内容；协议标识也应放在这里。 */
    content: JSONValue;
}

export interface ChannelPublishResult {
    /** 由 Keymaster/ChannelProtocol 生成的消息编号。 */
    messageId: string;
    /**
     * 出站签名明文的精确字节（已签名、未加密）；只有私密发布返回。
     * 调用方可把它作为出站证据原样保存，不需要也不允许重新签名。
     */
    signedMessage?: Uint8Array;
}

export interface ChannelSubscriptionSetParams {
    /** 替换当前 caller 的完整精确频道集合；空数组表示释放全部订阅。 */
    channels: string[];
}

export interface ChannelSubscriptionSetResult {
    /** Coordinator 已接受的当前 caller 逻辑期望集合；不代表 Supplier 物理订阅已完成。 */
    channels: string[];
    /**
     * Coordinator/Mux 返回的当前物理状态快照。
     * 旧 runtime 可以省略该字段；当前 Coordinator 会为每个 accepted
     * channel 返回一份权威快照，使新 caller 不必等待下一次状态事件。
     */
    statuses?: ChannelSubscriptionStatus[];
}

/** 当前 caller union 在 Coordinator/SSP 侧的物理订阅阶段。 */
export type ChannelSubscriptionPhase = "idle" | "subscribing" | "subscribed" | "retrying" | "blocked";

/** 订阅失败的稳定业务错误码；不得把底层异常/堆栈直接暴露给插件。 */
export type ChannelSubscriptionErrorCode = "config" | "connect" | "identity" | "protocol" | "balance" | "unknown_result" | "validation" | "unavailable" | "conflict";

export interface ChannelSubscriptionStatus {
    channel: string;
    phase: ChannelSubscriptionPhase;
    errorCode: ChannelSubscriptionErrorCode | null;
    errorMessage: string | null;
    updatedAtMs: number;
}

export interface ChannelMessageReceivedEventData {
    /** 实际收到的精确频道。 */
    channel: string;
    /** ChannelProtocol 验签得到的作者压缩公钥 hex。 */
    publisherPublicKeyHex: string;
    /** ChannelProtocol 消息编号。 */
    messageId: string;
    /** 已验签的 App JSON 内容。 */
    content: JSONValue;
    /**
     * 入站私密消息的加密信封精确字节（受信任插件用于原样留证）。
     * 公共消息或旧 Coordinator 可以省略。
     */
    rawEnvelope?: Uint8Array;
}

/** libp2p protocol ID；wire 真值来自 MSFile Proxy Wire Messages v1。 */
export const MSFILE_PROTOCOL_ID = "/msfile/1.0.0";

/** Frame / 内容硬上限。与 wire 规范一致，两层共同执行。 */
export const MSFILE_MAX_HEADER_BYTES = 65536;

export const MSFILE_MAX_SEED_BYTES = 16 * 1024 * 1024;

export const MSFILE_MAX_BLOCK_BYTES = 256 * 1024;

export const MSFILE_MAX_CONTENT_BYTES = MSFILE_MAX_SEED_BYTES;

export const MSFILE_MAX_ERROR_MESSAGE_BYTES = 1024;

export const MSFILE_BLOCK_SIZE_BYTES = 256 * 1024;

export const MSFILE_DIGEST_SIZE_BYTES = 32;

/** 单个内容对象的最高金额。规范十进制字符串："0" 表示显式不限。 */
export type MsFileSatoshiAmount = string;

/** Keymaster 内置本地 BitFS 来源的稳定路由标识。 */
export const MSFILE_LOCAL_SOURCE_ID = "local-bitfs";

/** MSFile 来源类型；本地来源不经过 `/msfile/1.0.0`。 */
export type MsFileSourceKind = "local-bitfs" | "remote-proxy";

/** 校验 MSFile 来源路由标识；拒绝路径字符和无界文本。 */
export function isValidMsFileSourceId(input: unknown): input is string {
    return typeof input === "string"
        && (input === MSFILE_LOCAL_SOURCE_ID || /^remote-proxy:(02|03)[0-9a-f]{64}$/u.test(input));
}

export interface MsFileStatParams {
    seedHashHex: string;
}

export interface MsFileContentReadParams extends MsFileStatParams {
    clientRequestId?: string;
    /** 本次下载任务的完整数据块单价上限，单位聪。 */
    maxFullBlockPriceSatoshis?: string;
}

export interface MsFileReadStatusParams {
    clientRequestId: string;
}

export type MsFileContentOpenParams = MsFileContentReadParams & MsFileReadStatusParams;

/** 查询钱包允许的块价范围，或按读取编号修改当前任务的手动块价。 */
export interface MsFileDownloadPriceParams {
    clientRequestId?: string;
    maxFullBlockPriceSatoshis?: string;
}

export interface MsFileDownloadPriceResult {
    /** 钱包允许应用设置的最大完整块单价，单位聪。 */
    walletMaxFullBlockPriceSatoshis: string;
}

export interface MsFileContentRangeParams extends MsFileReadStatusParams {
    offset: number;
    length: number;
}

export interface MsFileContentRangeResult {
    fileSizeBytes?: number;
    mediaType?: string;
    content?: BinaryField;
}

interface MsFileReadStatusDetails {
    clientRequestId: string;
    seedHashHex: string;
    taskId?: string;
    verifiedBlockCount?: number;
    totalBlockCount?: number;
    funds?: "none" | "pending" | "settled" | "problem";
    /** 此读取记录有权调整关联下载任务的手动块价。 */
    priceAdjustable?: true;
    /** 当前任务的完整数据块单价上限，单位聪。 */
    currentMaxFullBlockPriceSatoshis?: string;
}

/** Action for the caller: wait for content, read the complete file, or stop waiting. */
export type MsFileReadStatus = MsFileReadStatusDetails & (
    | { phase: "pending" | "available"; error?: never }
    | { phase: "stopped"; error: ProtocolError }
);

export interface MsFileStatAvailableEntry {
    supplierPublicKeyHex: string;
    status: "available";
    recommendedFilename: string;
    /** 十进制字符串形式的 uint64 字节数。 */
    fileSizeBytes: MsFileSatoshiAmount;
    mediaType: string;
}

export interface MsFileStatAbsentEntry {
    supplierPublicKeyHex: string;
    status: "absent";
}

export interface MsFileStatDiscoveringEntry {
    supplierPublicKeyHex: string;
    status: "discovering";
    retryAfterMs: number;
}

export interface MsFileStatQuotedEntry {
    supplierPublicKeyHex: string;
    status: "quoted";
    recommendedFilename: string;
    fileSizeBytes: MsFileSatoshiAmount;
    mediaType: string;
    minSeedPriceSatoshis: MsFileSatoshiAmount;
    maxSeedPriceSatoshis: MsFileSatoshiAmount;
    minFullBlockPriceSatoshis: MsFileSatoshiAmount;
    maxFullBlockPriceSatoshis: MsFileSatoshiAmount;
}

export interface MsFileStatNetworkErrorEntry {
    supplierPublicKeyHex: string;
    status: "network-error";
}

export type MsFileSupplierStat = MsFileStatAvailableEntry | MsFileStatAbsentEntry | MsFileStatDiscoveringEntry | MsFileStatQuotedEntry | MsFileStatNetworkErrorEntry;

export /** 远程 Proxy 结果补充来源路由信息后的公共视图。 */
type MsFileRemoteSourceStat<T> = T extends MsFileSupplierStat ? T & {
    sourceId: string; /** 固定为远程 Proxy。 */
    sourceKind: "remote-proxy";
} : never;

export /** local 结果没有远程供应商公钥，不能用假公钥占位。 */
type MsFileLocalSourceStat<T> = T extends MsFileSupplierStat ? Omit<T, "supplierPublicKeyHex"> & {
    sourceId: typeof MSFILE_LOCAL_SOURCE_ID; /** 固定为本地 BitFS。 */
    sourceKind: "local-bitfs";
} : never;

/** 统一 MSFile API 返回的 local/remote 来源状态。 */
export type MsFileSourceStat = MsFileRemoteSourceStat<MsFileSupplierStat> | MsFileLocalSourceStat<MsFileSupplierStat>;

export interface MsFileStatResult {
    seedHashHex: string;
    /** 所有本地与远程来源；本地来源固定排在第一位。 */
    sources: MsFileSourceStat[];
}

export interface MsFileSeedReadParams {
    /** 要读取的来源路由标识。 */
    sourceId: string;
    seedHashHex: string;
}

export interface MsFileBlockReadParams {
    /** 要读取的来源路由标识。 */
    sourceId: string;
    /** Block 所属 Seed；remote wire 不发送该字段。 */
    seedHashHex: string;
    blockHashHex: string;
}

export interface MsFileReadResult {
    contentHashHex: string;
    content: BinaryField;
}

export interface BinaryField {
    /** 固定 "binary"。缺省 / 其它值一律拒绝。 */
    $type: "binary";
    /** 真实字节；`structured clone` 会原样传过去。 */
    bytes: ArrayBuffer;
    /** 可选的内容类型；密文 / 图片 / 文件等有明确类型时填写。 */
    mime?: string;
}

/** 协议版本号；当前固定为 1。 */
// 产品尚未上线，公开协议持续在 v1 内演进，不维护旧字段兼容分支。
export const PROTOCOL_VERSION = 1;

/**
 * 协议错误码。`error.message` 走英文；UI 展示由调用方决定。
 * 错误码集合是稳定可判定的：第三方接入方写 switch 时不会因为新加错误
 * 类型而误把"未识别"分支当作"成功"。
 *
 * 触发语义（施工单 001 收口）：
 *   - invalid_request         顶层 message 结构 / 字段类型 / aud-iat-exp
 *                             规则 / BinaryField 形状不合法；
 *                             第一条非法 request 直接被 popup 忽略，
 *                             不回 result（"情况 B"）。
 *   - invalid_origin          identity.get / intent.sign 的
 *                             `params.aud !== event.origin`。
 *   - user_rejected           用户在确认页或解锁页点"取消"。
 *   - active_key_unavailable  vault 已 unlocked，但 walletState 没有 ready
 *                             active key（"情况 D"）。
 *   - decrypt_failed          cipher.decrypt 失败；origin 不匹配 / nonce
 *                             错误 / 密文被篡改 / 内层结构不合法，V1
 *                             统一为这一种错误。
 *   - internal_error          兜底：用户可见但不属于以上分类的失败。
 *
 * 注意：V1 **不**对外暴露 `wallet_locked` 错误码。locked 态在 popup 内
 * 直接走解锁页（"情况 C"），用户取消解锁统一回 `user_rejected`。任何
 * "locked 时直接拒绝"的中间态都不属于 V1 公开语义。
 */
export type ProtocolErrorCode =
/** Transport authority was revoked or belongs to another wallet/Worker generation. */
"connection_expired" | "authorization_expired" | "invalid_request" | "invalid_origin" | "user_rejected" | "active_key_unavailable" | "decrypt_failed"
/**
 * 请求资产与连接绑定的钱包网络不一致；accept 阶段拒绝，不进入业务执行。
 */
 | "asset_not_enabled"
/** Connect v1 明确排除的方法族（新费用池签名等）。 */
 | "unsupported_scope"
/** 通用支付需要已建立的可信来源会话（origin 是归属唯一基准）。 */
 | "identity_required"
/** 当前硬件后端缺少 Connect 支付所需的受信展示/结构检查。 */
 | "hardware_connect_payment_unsupported" | "payment_not_found"
/** Too many non-terminal Connect payment responsibilities. */
 | "payment_pending_limit"
/** Same stable request key with different facts, or a resumable MSFile read failure. */
 | "id_conflict" | "msfile_read_not_found" | "msfile_read_interrupted" | "msfile_read_cancelled" | "msfile_range_timeout"
 | "name_not_found" | "invalid_name" | "invalid_public_key" | "primary_name_required"
 | "domain_service_not_configured" | "domain_service_unavailable" | "domain_network_mismatch"
// MSFile 稳定公开错误码（施工单 §6）。supplier wire error code 保留为
// 内部诊断，不把任意远端字符串直接变成公开 code。
 | "msfile_not_configured" | "msfile_unavailable" | "msfile_identity_required" | "msfile_supplier_not_found" | "msfile_supplier_disabled" | "msfile_invalid_hash" | "msfile_price_limit_exceeded" | "msfile_integrity_error" | "msfile_content_not_found" | "msfile_rate_limited" | "msfile_supplier_error" | "msfile_transport_error" | "msfile_protocol_error" | "internal_error";

export interface ProtocolError {
    code: ProtocolErrorCode;
    message: string;
}

export interface ProtocolReadyMessage {
    v: typeof PROTOCOL_VERSION;
    type: "ready";
}

export interface ProtocolClosingMessage {
    v: typeof PROTOCOL_VERSION;
    type: "closing";
}

export interface ProtocolCancelMessage {
    /** Present for cancellation of an already-bound business request. */
    bindingId?: string;
    v: typeof PROTOCOL_VERSION;
    type: "cancel";
    /** 要取消的原 `request.id`。 */
    id: string;
}

/* ============== 顶层 event 报文（施工单 2026-09-02 Channel） ============== */
/**
 * 协议对外 event 名常量集合（server-pushed 事件）。
 *
 * 设计缘由：
 *   - `channel.message_received` 是已验签的 Channel 公开消息，只发送给
 *     当前 session 已精确订阅的频道；
 *   - `chain.height_changed` 是当前连接钱包已同步的链尖快照；
 */
export type ProtocolEventName = "channel.message_received" | "chain.height_changed";

/** 钱包同一次同步取得的链尖高度和哈希。 */
export interface ChainHeightResult {
    height: number;
    /** 64 位小写十六进制区块哈希。 */
    blockHash: string;
}

export interface IdentityGetParams {
    /** 目标站点 origin；必须等于 `event.origin`，否则拒绝。 */
    aud: string;
    /** 签发时间（unix seconds）。 */
    iat: number;
    /** 过期时间（unix seconds）；必须严格大于 iat。 */
    exp: number;
    /** 人类可读确认文案。 */
    text: string;
    /**
     * 请求索要的 claim 名列表。
     * - Keymaster 只返回请求里明确列出且当前本地有真值来源的 claim；
     * - 不存在的 claim 直接省略，不报错。
     */
    claims?: string[];
}

/** identity.get 解析后的 claim 真值。 */
export type ResolvedClaimValue = string | number | boolean | null | BinaryField | ResolvedClaimValue[] | {
    [key: string]: ResolvedClaimValue;
};

export interface IdentityGetResult {
    /** Identity 信封最终真值字节（Deterministic CBOR）。 */
    identityEnvelope: BinaryField;
    /** 签名（compact 64-byte secp256k1）。 */
    signature: BinaryField;
    /** 签名主体公钥（33-byte compressed）。 */
    subject: {
        publicKey: BinaryField;
    };
    /** Keymaster 本次实际返回给调用方的 claim 真值。 */
    resolvedClaims: Record<string, ResolvedClaimValue>;
}

export interface IntentSignParams {
    /** 目标站点 origin；必须等于 `event.origin`，否则拒绝。 */
    aud: string;
    /** 签发时间（unix seconds）。 */
    iat: number;
    /** 过期时间（unix seconds）；必须严格大于 iat。 */
    exp: number;
    /** 人类可读确认文案。 */
    text: string;
    /** 调用方自定义的内容类型。 */
    contentType: string;
    /** 调用方准备好的最终二进制内容。允许为空字节。 */
    content: BinaryField;
}

export interface IntentSignResult {
    /** 签名信封最终真值字节（Deterministic CBOR）。 */
    signedEnvelope: BinaryField;
    /** 签名（compact 64-byte secp256k1）。 */
    signature: BinaryField;
}

export interface CipherEncryptParams {
    /** 人类可读确认文案。 */
    text: string;
    /** 调用方自定义的内容类型；与 contentBytes 一起进入密文内层结构。 */
    contentType: string;
    /** 业务字节本体。 */
    content: BinaryField;
}

export interface CipherEncryptResult {
    /** 本次加密随机生成的 12 字节 nonce。 */
    nonce: BinaryField;
    /** AES-GCM 密文字节（含认证 tag）。 */
    cipherbytes: BinaryField;
}

export interface CipherDecryptParams {
    /** 人类可读确认文案。 */
    text: string;
    /** 加密时保存的 12 字节 nonce。 */
    nonce: BinaryField;
    /** 加密时保存的密文字节。 */
    cipherbytes: BinaryField;
}

export interface CipherDecryptResult {
    /** 密文内层结构里的 contentType。 */
    contentType: string;
    /** 还原后的业务字节。 */
    content: BinaryField;
}

export type P2pkhTransferAssetId = "bsv-mainnet" | "bsv-testnet";

/* ============== payment.pay / payment.status ============== */
/** Connect v1 输出支付：业务输出数组，顺序即链上顺序。 */
export interface PaymentOutput {
    /** 聪，允许 0（数据输出）。必须为非负安全整数。 */
    amount: number;
    /** locking script hex；偶数长度 hex，允许空字符串（零长度锁定脚本）。 */
    script: string;
}

export type ConnectPaymentStatus = "pending" | "not_signed" | "signed_not_dispatched" | "unknown" | "failed" | "accepted" | "already_known";

export interface PaymentPayParams {
    /** 稳定幂等身份，1–128 字符。 */
    clientRequestId: string;
    /** 业务输出；非空，顺序即链上顺序，找零由钱包追加。 */
    outputs: PaymentOutput[];
}

export interface PaymentReleaseSummary {
    /** Historical amount safely released, NOT the current wallet balance. */
    releasedSatoshis: string;
    releasedInputCount: number;
    spentInputCount: number;
    heldInputCount: number;
}

export interface PaymentPayResult {
    paymentId: string;
    clientRequestId: string;
    status: ConnectPaymentStatus;
    assetId: P2pkhTransferAssetId;
    /** 只有 accepted/already_known 才有 canonical txid。 */
    txid?: string;
    feeSatoshis?: number;
    changeSatoshis?: number;
    approval?: "automatic" | "manual" | "unknown";
    /** 稳定原因码；不包含签名/交易原文。 */
    reason?: string;
    release?: PaymentReleaseSummary;
}

export interface PaymentStatusParams {
    clientRequestId: string;
}

export type PaymentStatusResult = PaymentPayResult;

export interface ChainOutpoint {
    txid: string;
    vout: number;
}

export interface PaymentDataSignature {
    outputIndex: number;
    offset: number;
    prefixHex: string;
    suffixHex: string;
}

export interface PaymentPrepareParams extends PaymentStatusParams {
    outputs: PaymentOutput[];
    dataSignature: PaymentDataSignature;
}

export type PaymentPrepareResult = PaymentPayResult & {
    reservation?: { reservationId: string; inputs: ChainOutpoint[]; expiresAt: number };
};

export interface PaymentReservationParams extends PaymentStatusParams {
    reservationId: string;
}

export interface PaymentCommitParams extends PaymentReservationParams {
    signingObject: BinaryField;
}

export type ChainScriptHistoryParams = { script: string } & (
    { state: "confirmed"; fromHeight: number; toHeight: number; cursor?: string }
    | { state: "unconfirmed"; cursor?: string }
);

export interface ChainScriptHistoryResult {
    entries: Array<{ txid: string; height: number | null }>;
    cursor?: string;
}

export type ChainTransactionResult =
    | { state: "not_observed" | "invalid" }
    | { state: "unconfirmed"; rawTxHex: string }
    | { state: "confirmed"; rawTxHex: string; height: number; blockHash: string; index: number };

export type ChainTransactionBatchParams = { txids: string[]; mode: "raw" | "status" };

export type ChainTransactionBatchEntry = { txid: string } & (
    | { state: "not_observed" }
    | { state: "unconfirmed"; rawTxHex?: string }
    | { state: "confirmed"; height: number; blockHash: string; rawTxHex?: string }
);

export interface ChainTransactionBatchResult {
    /** Missing IDs have no usable observation in this response and can be retried. */
    entries: ChainTransactionBatchEntry[];
}

export interface ChainBroadcastResult {
    state: "accepted" | "rejected" | "unknown";
    txid: string;
}

export interface ApplicationPaymentParams {
    purpose: string;
    inputs: ChainOutpoint[];
    address: string;
    feeSatoshis: number;
    rawTxHex: string;
}

export interface MsFileImportParams {
    fileName: string;
    content: BinaryField;
}

export interface MsFileContentResult {
    seed: BinaryField;
    content: BinaryField;
}

/** Signed by the connected wallet over the canonical login-proof envelope. */
export interface ConnectLoginProof {
    envelope: BinaryField;
    signature: BinaryField;
}

export interface ConnectLoginParams {
    /** One-time challenge issued by the application backend (32 bytes, lowercase hex). */
    loginChallenge?: string;
    /** 人类可读确认文案。 */
    text: string;
    /**
     * 请求索要的 claim 名列表（与 `identity.get` 同语义）。
     * 缺省 = `[]`，不返回任何 claim；通常 caller 想获取 profile.* 时必须显式列出。
     */
    claims?: string[];
    /**
     * App 入口的发布来源证明记录字符串（`base64url(规范JSON).签名hex`）。
     * SDK 从当前入口 HTML 头读取并整体提交，不解码、不校验内容；
     * 钱包解码、验签并核对证明 origin 与可信 event.origin，应用不能自报来源。
     * 本地 Files 部署不依赖该字段（以 daemon 可信部署登记为准）。
     */
    publicationProof?: string;
}

export interface ConnectLoginResult {
    /** Present when the request includes loginChallenge. */
    loginProof?: ConnectLoginProof;
    /** 不透明恢复凭据，绑定原钱包和精确来源；不得写入日志或 URL。 */
    authorizationId: string;
    networkIdentity: NetworkIdentity;
    /** 本次 login 时一次解析的 claims 真值快照。 */
    resolvedClaims: Record<string, ResolvedClaimValue>;
    /** 本次解析时间（unix milliseconds）。 */
    resolvedAt: number;
}

export interface ConnectLogoutParams extends Record<string, never> {
}

export interface ConnectLogoutResult {
    /** 吊销时间（unix milliseconds）。 */
    revokedAt: number;
}

export interface ConnectLaunchParams {
    /** One-time challenge issued by the application backend (32 bytes, lowercase hex). */
    loginChallenge?: string;
    /** 由 launcher 写入 client app 启动 URL 的 launchToken。一次性消费。 */
    launchToken: string;
    /**
     * App 入口的发布来源证明记录字符串（可选；钱包发起的目录启动一般不需要客户端提交，
     * 钱包从所选入口自行读取；应用提交时钱包核对一致性，不能自报来源）。
     */
    publicationProof?: string;
}

export interface ConnectLaunchResult {
    /** Present when the request includes loginChallenge. */
    loginProof?: ConnectLoginProof;
    authorizationId: string;
    networkIdentity: NetworkIdentity;
    resolvedClaims: Record<string, ResolvedClaimValue>;
    resolvedAt: number;
}

/** 协议方法名常量集合。 */
export const DOMAIN_MAX_PROFILES = 100;

export interface DomainProfile {
    publicKeyHex: string;
    domain: string;
    avatar?: { seedHashHex: string };
    header?: { seedHashHex: string };
    text?: Record<string, string>;
    expiresAt: number;
}

export type ProfileResult =
    | { publicKeyHex: string; profile: DomainProfile }
    | { publicKeyHex: string; error: { code: "invalid_public_key" | "name_not_found" | "primary_name_required" } };

export interface DomainProfilesResult {
    results: ProfileResult[];
}

export interface DomainProfilesParams {
    publicKeys: string[];
    serviceId?: string;
}

export interface DomainGetPublicKeyParams {
    domain: string;
    serviceId?: string;
}

export const PROTOCOL_METHODS = [
    "identity.get",
    "intent.sign",
    "cipher.encrypt",
    "cipher.decrypt",
    "payment.pay",
    "payment.status",
    "payment.prepare",
    "payment.commit",
    "payment.cancel",
    "chain.get_height",
    "chain.list_script_history",
    "chain.get_transaction",
    "chain.get_transactions",
    "chain.list_script_unspent",
    "chain.broadcast",
    "application.key",
    "application.sign_message",
    "application.sign_payment",
    "msfile.seller.status",
    "msfile.import",
    "msfile.content.read",
    "msfile.content.status",
    "msfile.content.open",
    "msfile.content.price",
    "msfile.content.range",
    "domain.profiles",
    "domain.get_public_key",
    "connect.login",
    "connect.logout",
    "connect.launch",
    // Channel 是唯一的公开频道 API，见 docs/SatSubscription与Channel.md。
    "channel.publish",
    "channel.subscription_set",
    // MSFile 对外方法族，见 docs/MSFile.md。作为
    // session-bound 且强制要求可信来源会话；Seed/Block 显式区分，
    // Read 不接受 maxPriceSatoshis（金额只能来自 Keymaster 设置或用户确认）。
    "msfile.stat",
    "msfile.seed.read",
    "msfile.block.read"
] as const;
export type ProtocolMethod = (typeof PROTOCOL_METHODS)[number];
/* ============== Method dispatch ============== */
/**
 * 方法 -> 请求参数类型 的映射。`MethodParams<M>` 是计算出的参数类型。
 * 业务代码里直接 `MethodParams<"identity.get">` 等价于 `IdentityGetParams`。
 */
export interface MethodParamsMap {
    "identity.get": IdentityGetParams;
    "intent.sign": IntentSignParams;
    "cipher.encrypt": CipherEncryptParams;
    "cipher.decrypt": CipherDecryptParams;
    "payment.pay": PaymentPayParams;
    "payment.status": PaymentStatusParams;
    "payment.prepare": PaymentPrepareParams;
    "payment.commit": PaymentCommitParams;
    "payment.cancel": PaymentReservationParams;
    "chain.get_height": {};
    "chain.list_script_history": ChainScriptHistoryParams;
    "chain.get_transaction": { txid: string; observedRawTxHex?: string };
    "chain.get_transactions": ChainTransactionBatchParams;
    "chain.list_script_unspent": { script: string };
    "chain.broadcast": { rawTxHex: string };
    "application.key": { purpose: string };
    "application.sign_message": { purpose: string; message: BinaryField };
    "application.sign_payment": ApplicationPaymentParams;
    "msfile.seller.status": {};
    "msfile.import": MsFileImportParams;
    "msfile.content.read": MsFileContentReadParams;
    "msfile.content.status": MsFileReadStatusParams;
    "msfile.content.open": MsFileContentOpenParams;
    "msfile.content.price": MsFileDownloadPriceParams;
    "msfile.content.range": MsFileContentRangeParams;
    "domain.profiles": DomainProfilesParams;
    "domain.get_public_key": DomainGetPublicKeyParams;
    "connect.login": ConnectLoginParams;
    "connect.logout": ConnectLogoutParams;
    "connect.launch": ConnectLaunchParams;
    "channel.publish": ChannelPublishParams;
    "channel.subscription_set": ChannelSubscriptionSetParams;
    "msfile.stat": MsFileStatParams;
    "msfile.seed.read": MsFileSeedReadParams;
    "msfile.block.read": MsFileBlockReadParams;
}
export interface MethodResultMap {
    "identity.get": IdentityGetResult;
    "intent.sign": IntentSignResult;
    "cipher.encrypt": CipherEncryptResult;
    "cipher.decrypt": CipherDecryptResult;
    "payment.pay": PaymentPayResult;
    "payment.status": PaymentStatusResult;
    "payment.prepare": PaymentPrepareResult;
    "payment.commit": PaymentPayResult;
    "payment.cancel": PaymentPayResult;
    "chain.get_height": ChainHeightResult;
    "chain.list_script_history": ChainScriptHistoryResult;
    "chain.get_transaction": ChainTransactionResult;
    "chain.get_transactions": ChainTransactionBatchResult;
    "chain.list_script_unspent": { outputs: Array<ChainOutpoint & { satoshis: number }> };
    "chain.broadcast": ChainBroadcastResult;
    "application.key": { publicKeyHex: string };
    "application.sign_message": { publicKeyHex: string; signature: BinaryField };
    "application.sign_payment": { rawTxHex: string };
    "msfile.seller.status": { ready: boolean };
    "msfile.import": { seedHashHex: string };
    "msfile.content.read": MsFileContentResult;
    "msfile.content.status": MsFileReadStatus;
    "msfile.content.open": MsFileReadStatus;
    "msfile.content.price": MsFileDownloadPriceResult;
    "msfile.content.range": MsFileContentRangeResult;
    "domain.profiles": DomainProfilesResult;
    "domain.get_public_key": { publicKeyHex: string };
    "connect.login": ConnectLoginResult;
    "connect.logout": ConnectLogoutResult;
    "connect.launch": ConnectLaunchResult;
    "channel.publish": ChannelPublishResult;
    "channel.subscription_set": ChannelSubscriptionSetResult;
    "msfile.stat": MsFileStatResult;
    "msfile.seed.read": MsFileReadResult;
    "msfile.block.read": MsFileReadResult;
}

export type MethodParams<M extends ProtocolMethod> = M extends ProtocolMethod ? keyof MethodParamsMap[M] extends never ? Record<string, never> : MethodParamsMap[M] : never;
export type MethodResult<M extends ProtocolMethod = ProtocolMethod> = MethodResultMap[M];
export type ProtocolEventPayload =
  | { v: typeof PROTOCOL_VERSION; type: "event"; event: "channel.message_received"; data: ChannelMessageReceivedEventData }
  | { v: typeof PROTOCOL_VERSION; type: "event"; event: "chain.height_changed"; data: ChainHeightResult };
export type ProtocolEventMessage = ProtocolEventPayload & { networkIdentity: NetworkIdentity; bindingId: string };
export interface ProtocolRequestMessage<M extends ProtocolMethod = ProtocolMethod> {
  v: typeof PROTOCOL_VERSION; type: "request"; id: string; method: M; params: MethodParams<M>; bindingId?: string;
}
export type ProtocolResultMessage =
  | { v: typeof PROTOCOL_VERSION; type: "result"; id: string; ok: true; result: MethodResult; networkIdentity: NetworkIdentity; bindingId: string }
  | { v: typeof PROTOCOL_VERSION; type: "result"; id: string; ok: false; error: ProtocolError; networkIdentity?: NetworkIdentity };
