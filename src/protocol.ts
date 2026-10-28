/** Connect v1 公开契约。独立于钱包内部执行 DTO、能力框架和持久化。 */

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

export type AppRequirement = "private-key" | "storage";

export interface AppIdentityProofV1 {
    version: 1;
    publisherPublicKey: string;
    app: {
        id: string;
        name: string;
        description: string;
    };
    requirements: AppRequirement[];
    signature: string;
}

export interface VerifiedAppIdentity {
    version: 1;
    publisherPublicKeyHex: string;
    appId: string;
    appName: string;
    identityDigestHex: string;
}

export type AppIdentitySnapshot = VerifiedAppIdentity;

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

export interface StorageListParams {
    /** 目录前缀。 */
    prefix?: string;
    /** 分页游标。 */
    cursor?: string;
    /** 每页数量。 */
    limit?: number;
}

export interface StorageListEntry {
    /** Connect 可见的相对路径。 */
    path: string;
    /** 当前目录下的文件名。 */
    name: string;
    /** 文件大小（字节）。 */
    size: number;
    /** 抽象版本标签。 */
    revision?: string;
    /** 最后修改时间。 */
    lastModified?: string;
}

export interface StorageListResult {
    /** 当前目录前缀。 */
    prefix: string;
    /** 父目录前缀。 */
    parentPrefix: string;
    /** 虚拟目录列表。 */
    directories: Array<{
        path: string;
        name: string;
    }>;
    /** 当前页文件。 */
    files: StorageListEntry[];
    /** 目录 marker 路径。 */
    markerPath?: string;
    /** 下一页游标。 */
    nextCursor?: string;
}

export interface StorageDirectoryParams {
    /** 目录路径。 */
    path: string;
    /** 是否允许覆盖已有 marker。 */
    overwrite?: boolean;
}

export interface StorageDirectoryResult {
    /** 目录路径。 */
    path: string;
    /** 是否创建。 */
    created?: boolean;
    /** 是否删除。 */
    deleted?: boolean;
}

export interface StoragePutParams {
    /** 文件路径。 */
    path: string;
    /** 二进制文件内容。 */
    content: BinaryField;
    /** MIME 类型。 */
    contentType?: string;
    /** 是否覆盖已有对象。 */
    overwrite?: boolean;
}

export interface StoragePutResult {
    /** 文件路径。 */
    path: string;
    /** 写入大小（字节）。 */
    size: number;
    /** 抽象版本标签。 */
    revision?: string;
    /** 写入时间戳（毫秒）。 */
    updatedAt: number;
}

export interface StorageGetParams {
    /** 文件路径。 */
    path: string;
    /** 起始偏移（字节）。 */
    offset?: number;
    /** 读取长度（字节）。 */
    length?: number;
    /** 期望的抽象版本标签。 */
    ifMatch?: string;
}

export interface StorageGetResult {
    /** 文件路径。 */
    path: string;
    /** 二进制内容。 */
    content: BinaryField;
    /** MIME 类型。 */
    contentType?: string;
    /** 实际起始偏移。 */
    offset: number;
    /** 文件总大小（字节）。 */
    totalSize: number;
    /** 是否已读到文件结尾。 */
    eof: boolean;
    /** 抽象版本标签。 */
    revision?: string;
    /** 最后修改时间。 */
    lastModified?: string;
}

export interface StorageDeleteParams {
    /** 文件路径。 */
    path: string;
}

export interface StorageDeleteResult {
    /** 文件路径。 */
    path: string;
    /** 固定成功标记。 */
    deleted: true;
    /** 删除时间戳（毫秒）。 */
    updatedAt: number;
}

// K-V、partition、commit 和 revision 契约。
/** K-V 引擎的硬限制；字段名和单位均在此集中定义。 */
export const STORAGE_MAX_PAYLOAD_BYTES = 16 * 1024 * 1024;

export const STORAGE_DEFAULT_LIST_LIMIT = 200;

export const STORAGE_MAX_LIST_LIMIT = 1000;

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
"connection_expired" | "invalid_request" | "invalid_origin" | "user_rejected" | "active_key_unavailable" | "decrypt_failed"
/**
 * 请求资产与连接绑定的钱包网络不一致；accept 阶段拒绝，不进入业务执行。
 */
 | "asset_not_enabled"
/** Connect v1 明确排除的方法族（新费用池签名等）。 */
 | "unsupported_scope"
/** 通用支付需要已验证 App 身份（publisher 是归属唯一基准）。 */
 | "identity_required"
/** 当前硬件后端缺少 Connect 支付所需的受信展示/结构检查。 */
 | "hardware_connect_payment_unsupported" | "payment_not_found"
/** Too many non-terminal Connect payment responsibilities. */
 | "payment_pending_limit"
/** Same stable payment key with different frozen facts. */
 | "id_conflict" | "storage_not_configured" | "storage_unavailable" | "storage_invalid_path" | "storage_not_found" | "storage_conflict" | "storage_forbidden" | "storage_limit_exceeded" | "storage_provider_error" | "storage_identity_required"
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
 */
export type ProtocolEventName = "channel.message_received";

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

export interface PaymentChannelRegisterParams {
    channelName: string;
    paymentType: "p2pkh" | "p2pk";
}

export interface PaymentChannelRegisterResult {
    channelId: string;
}

/**
 * Connect 公开的 P2PKH 资产标识。
 *
 * 设计缘由（施工单 2026-09-18 001 多资产硬切换）：
 *   - 公开命名固定 `bsv-mainnet` / `bsv-testnet`，不暴露 p2pkh 内部
 *     的 `bsv` / `bsvtest`；
 *   - 资产由连接绑定的钱包网络决定，调用方不能选择或覆盖该网络。
 */
export type P2pkhTransferAssetId = "bsv-mainnet" | "bsv-testnet";

export interface P2pkhTransferParams {
    /** 先注册取得的完整渠道编号；不允许宿主代填或省略。 */
    channelId: string;
    /** 主网或 testnet P2PKH 地址（base58check，version 0x00 / 0x6f）。 */
    recipientAddress: string;
    /** 正整数 satoshis。 */
    amountSatoshis: number;
    /** 可选费率（sat/kB），>= 1；缺省由钱包当前网络的有效费率策略决定。 */
    feeRateSatoshisPerKb?: number;
}

export interface P2pkhTransferResult {
    /** 本次实际转账的资产，与连接绑定的钱包网络一致。 */
    assetId: P2pkhTransferAssetId;
    /** 已广播交易的 canonical txid。 */
    txid: string;
    /** 已签名交易 raw hex。 */
    rawTxHex: string;
    /** 实际花费的 fee satoshis。 */
    feeSatoshis: number;
}

/* ============== payment.pay / payment.status ============== */
/** Connect v1 支付方案；业务种类（businessKind）是独立维度。 */
export type ConnectPaymentType = "p2pkh" | "p2pk";

export type ConnectPaymentRecipientOwnership = "app-publisher" | "third-party" | "unknown";

export type ConnectPaymentStatus = "pending" | "not_signed" | "signed_not_dispatched" | "unknown" | "failed" | "accepted" | "already_known";

/** 收款材料：类型必须与 paymentType 一致。 */
export type ConnectPaymentRecipient = {
    type: "p2pkh";
    address: string;
} | {
    type: "p2pk";
    publicKeyHex: string;
};

export interface PaymentPayParams {
    channelId: string;
    /** 稳定幂等身份，1–128 字符。 */
    clientRequestId: string;
    paymentType: ConnectPaymentType;
    /** App 声明的业务用途；展示时不是可信商业结论。 */
    businessKind: string;
    /** 业务金额（聪，不含矿工费）。 */
    amountSatoshis: number;
    /** 可选希望费率（sat/kB）；缺省由钱包当前网络的有效费率策略决定。 */
    feeRateSatoshisPerKb?: number;
    recipient: ConnectPaymentRecipient;
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
    paymentType: ConnectPaymentType;
    recipientOwnership: ConnectPaymentRecipientOwnership;
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

export interface ConnectLoginParams {
    /** 人类可读确认文案。 */
    text: string;
    /**
     * 请求索要的 claim 名列表（与 `identity.get` 同语义）。
     * 缺省 = `[]`，不返回任何 claim；通常 caller 想获取 profile.* 时必须显式列出。
     */
    claims?: string[];
    /** 发布者签名的 caller identity proof；缺省时建立无 storage 的普通 session。 */
    appIdentity?: AppIdentityProofV1;
}

export interface ConnectLoginResult {
    networkIdentity: NetworkIdentity;
    /** 本次 login 时一次解析的 claims 真值快照。 */
    resolvedClaims: Record<string, ResolvedClaimValue>;
    /** 本次解析时间（unix milliseconds）。 */
    resolvedAt: number;
    appIdentity?: AppIdentitySnapshot;
}

export interface ConnectResumeParams {
    /** 本地数据重置后重新验证已有发行人签名 proof。 */
    appIdentity?: AppIdentityProofV1;
}

export interface ConnectResumeResult {
    networkIdentity: NetworkIdentity;
    resolvedClaims: Record<string, ResolvedClaimValue>;
    /**
     * 解析时间——本次 resume 时间戳，**不**是 connect.login 时的快照时间。
     * 给 caller 用来做"是否要重新登录"的客户端超时策略。
     */
    resolvedAt: number;
    appIdentity?: AppIdentitySnapshot;
}

export interface ConnectLogoutParams extends Record<string, never> {
}

export interface ConnectLogoutResult {
    /** 吊销时间（unix milliseconds）。 */
    revokedAt: number;
}

export interface ConnectLaunchParams {
    /** 由 launcher 写入 client app 启动 URL 的 launchToken。一次性消费。 */
    launchToken: string;
    /** 与 launcher 预建 session 绑定的完整签名 proof。 */
    appIdentity: AppIdentityProofV1;
}

export interface ConnectLaunchResult {
    networkIdentity: NetworkIdentity;
    resolvedClaims: Record<string, ResolvedClaimValue>;
    resolvedAt: number;
    appIdentity?: AppIdentitySnapshot;
}

/** 协议方法名常量集合。 */
export const PROTOCOL_METHODS = [
    "identity.get",
    "intent.sign",
    "cipher.encrypt",
    "cipher.decrypt",
    "p2pkh.transfer",
    "payment.pay",
    "payment.status",
    "payment.channel.register",
    "connect.login",
    "connect.resume",
    "connect.logout",
    "connect.launch",
    // Channel 是唯一的公开频道 API，见 docs/SatSubscription与Channel.md。
    "channel.publish",
    "channel.subscription_set",
    "storage.list",
    "storage.directory.create",
    "storage.directory.delete",
    "storage.put",
    "storage.get",
    "storage.delete",
    // MSFile 对外方法族，见 docs/MSFile.md。与 storage.* 同为
    // session-bound 且强制要求 verified App Identity；Seed/Block 显式区分，
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
    "payment.channel.register": PaymentChannelRegisterParams;
    "identity.get": IdentityGetParams;
    "intent.sign": IntentSignParams;
    "cipher.encrypt": CipherEncryptParams;
    "cipher.decrypt": CipherDecryptParams;
    "p2pkh.transfer": P2pkhTransferParams;
    "payment.pay": PaymentPayParams;
    "payment.status": PaymentStatusParams;
    "connect.login": ConnectLoginParams;
    "connect.resume": ConnectResumeParams;
    "connect.logout": ConnectLogoutParams;
    "connect.launch": ConnectLaunchParams;
    "channel.publish": ChannelPublishParams;
    "channel.subscription_set": ChannelSubscriptionSetParams;
    "storage.list": StorageListParams;
    "storage.directory.create": StorageDirectoryParams;
    "storage.directory.delete": StorageDirectoryParams;
    "storage.put": StoragePutParams;
    "storage.get": StorageGetParams;
    "storage.delete": StorageDeleteParams;
    "msfile.stat": MsFileStatParams;
    "msfile.seed.read": MsFileSeedReadParams;
    "msfile.block.read": MsFileBlockReadParams;
}
export interface MethodResultMap {
    "payment.channel.register": PaymentChannelRegisterResult;
    "identity.get": IdentityGetResult;
    "intent.sign": IntentSignResult;
    "cipher.encrypt": CipherEncryptResult;
    "cipher.decrypt": CipherDecryptResult;
    "p2pkh.transfer": P2pkhTransferResult;
    "payment.pay": PaymentPayResult;
    "payment.status": PaymentStatusResult;
    "connect.login": ConnectLoginResult;
    "connect.resume": ConnectResumeResult;
    "connect.logout": ConnectLogoutResult;
    "connect.launch": ConnectLaunchResult;
    "channel.publish": ChannelPublishResult;
    "channel.subscription_set": ChannelSubscriptionSetResult;
    "storage.list": StorageListResult;
    "storage.directory.create": StorageDirectoryResult;
    "storage.directory.delete": StorageDirectoryResult;
    "storage.put": StoragePutResult;
    "storage.get": StorageGetResult;
    "storage.delete": StorageDeleteResult;
    "msfile.stat": MsFileStatResult;
    "msfile.seed.read": MsFileReadResult;
    "msfile.block.read": MsFileReadResult;
}

export type MethodParams<M extends ProtocolMethod> = M extends ProtocolMethod ? keyof MethodParamsMap[M] extends never ? Record<string, never> : MethodParamsMap[M] : never;
export type MethodResult<M extends ProtocolMethod = ProtocolMethod> = MethodResultMap[M];
export type ProtocolEventPayload =
  { v: typeof PROTOCOL_VERSION; type: "event"; event: "channel.message_received"; data: ChannelMessageReceivedEventData };
export type ProtocolEventMessage = ProtocolEventPayload & { networkIdentity: NetworkIdentity; bindingId: string };
export interface ProtocolRequestMessage<M extends ProtocolMethod = ProtocolMethod> {
  v: typeof PROTOCOL_VERSION; type: "request"; id: string; method: M; params: MethodParams<M>; bindingId?: string;
}
export type ProtocolResultMessage =
  | { v: typeof PROTOCOL_VERSION; type: "result"; id: string; ok: true; result: MethodResult; networkIdentity: NetworkIdentity; bindingId: string }
  | { v: typeof PROTOCOL_VERSION; type: "result"; id: string; ok: false; error: ProtocolError; networkIdentity?: NetworkIdentity };
