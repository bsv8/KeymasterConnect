import * as P from "./protocol.js";
import { AppIdentityValidationError, verifyAppIdentityProof } from "./appIdentity.js";
import {
  validateNetworkIdentity, PROTOCOL_VERSION, PROTOCOL_METHODS,
  STORAGE_MAX_PAYLOAD_BYTES, STORAGE_DEFAULT_LIST_LIMIT, STORAGE_MAX_LIST_LIMIT, isValidMsFileSourceId,
  type NetworkIdentity, type JSONValue, type ChannelPublishParams, type ChannelSubscriptionSetParams,
  type StorageListParams, type StorageDirectoryParams, type StoragePutParams,
  type StorageGetParams, type StorageDeleteParams, type MsFileStatParams, type MsFileSeedReadParams,
  type MsFileBlockReadParams, type BinaryField, type ProtocolErrorCode, type IdentityGetParams,
  type IntentSignParams, type CipherEncryptParams, type CipherDecryptParams, type P2pkhTransferAssetId,
  type PaymentChannelRegisterParams, type PaymentPayParams, type PaymentStatusParams,
  type ConnectLoginParams, type ConnectResumeParams, type ConnectLogoutParams, type ConnectLaunchParams,
  type ProtocolMethod, type ProtocolRequestMessage,
} from "./protocol.js";
/** 校验失败：抛出的对象。service 会捕获并组装 ProtocolError。 */
export class ProtocolValidationError extends Error {
    readonly code: ProtocolErrorCode;
    constructor(code: ProtocolErrorCode, message: string) {
        super(message);
        this.code = code;
        this.name = "ProtocolValidationError";
    }
}

function validateIdentityGetParams(raw: unknown): IdentityGetParams {
    const obj = expectObject(raw, "identity.get params");
    const aud = expectString(obj.aud, "aud");
    const iat = expectInteger(obj.iat, "iat");
    const exp = expectInteger(obj.exp, "exp");
    const text = expectString(obj.text, "text");
    if (exp <= iat) {
        throw new ProtocolValidationError("invalid_request", "exp must be greater than iat");
    }
    if (obj.claims !== undefined) {
        if (!Array.isArray(obj.claims)) {
            throw new ProtocolValidationError("invalid_request", "claims must be an array of strings");
        }
        for (const c of obj.claims) {
            if (typeof c !== "string") {
                throw new ProtocolValidationError("invalid_request", "claims entries must be strings");
            }
        }
    }
    return { aud, iat, exp, text, claims: obj.claims as string[] | undefined };
}

function validateIntentSignParams(raw: unknown): IntentSignParams {
    const obj = expectObject(raw, "intent.sign params");
    const aud = expectString(obj.aud, "aud");
    const iat = expectInteger(obj.iat, "iat");
    const exp = expectInteger(obj.exp, "exp");
    const text = expectString(obj.text, "text");
    const contentType = expectString(obj.contentType, "contentType");
    if (exp <= iat) {
        throw new ProtocolValidationError("invalid_request", "exp must be greater than iat");
    }
    const content = parseBinaryField(obj.content, "content");
    return { aud, iat, exp, text, contentType, content };
}

function validateCipherEncryptParams(raw: unknown): CipherEncryptParams {
    const obj = expectObject(raw, "cipher.encrypt params");
    const text = expectString(obj.text, "text");
    const contentType = expectString(obj.contentType, "contentType");
    const content = parseBinaryField(obj.content, "content");
    return { text, contentType, content };
}

function validateCipherDecryptParams(raw: unknown): CipherDecryptParams {
    const obj = expectObject(raw, "cipher.decrypt params");
    const text = expectString(obj.text, "text");
    const nonce = parseBinaryField(obj.nonce, "nonce");
    const cipherbytes = parseBinaryField(obj.cipherbytes, "cipherbytes");
    return { text, nonce, cipherbytes };
}

/** 严格比较 `aud` 与 `event.origin`；不补端口 / 不 lower host。 */
export function assertOriginMatches(aud: string, eventOrigin: string): void {
    if (aud !== eventOrigin) {
        throw new ProtocolValidationError("invalid_origin", "aud does not match event origin");
    }
}

/* ============== Connect v1 payment.pay / payment.status ============== */
function validatePaymentPayParams(raw: unknown, network: "main" | "test"): PaymentPayParams {
    const obj = expectObject(raw, "payment.pay params");
    const allowed = ["channelId", "clientRequestId", "paymentType", "businessKind", "amountSatoshis", "feeRateSatoshisPerKb", "recipient"];
    for (const key of Object.keys(obj))
        if (!allowed.includes(key))
            throw new ProtocolValidationError("invalid_request", "payment.pay contains an unsupported field");
    const clientRequestId = expectNonEmptyString(obj.clientRequestId, "clientRequestId");
    if (clientRequestId.length > 128 || !/^[A-Za-z0-9._:-]+$/u.test(clientRequestId))
        throw new ProtocolValidationError("invalid_request", "clientRequestId is invalid");
    const paymentType = obj.paymentType;
    if (paymentType !== "p2pkh" && paymentType !== "p2pk")
        throw new ProtocolValidationError("invalid_request", "paymentType is unsupported");
    const businessKind = expectNonEmptyString(obj.businessKind, "businessKind");
    if (businessKind.length > 64 || !/^[A-Za-z0-9][A-Za-z0-9._:-]*$/u.test(businessKind))
        throw new ProtocolValidationError("invalid_request", "businessKind is invalid");
    const recipient = expectObject(obj.recipient, "recipient");
    if (paymentType === "p2pkh") {
        if (recipient.type !== "p2pkh")
            throw new ProtocolValidationError("invalid_request", "recipient.type must match paymentType");
        for (const key of Object.keys(recipient))
            if (key !== "type" && key !== "address")
                throw new ProtocolValidationError("invalid_request", "recipient contains an unsupported field");
        const address = expectString(recipient.address, "recipient.address");
        const assetId = (network === "test" ? "bsv-testnet" : "bsv-mainnet");
        assertP2pkhAddressForAsset(address, assetId ?? "bsv-mainnet");
    }
    else {
        if (recipient.type !== "p2pk")
            throw new ProtocolValidationError("invalid_request", "recipient.type must match paymentType");
        for (const key of Object.keys(recipient))
            if (key !== "type" && key !== "publicKeyHex")
                throw new ProtocolValidationError("invalid_request", "recipient contains an unsupported field");
        assertCompressedPubkeyHex(expectString(recipient.publicKeyHex, "recipient.publicKeyHex"));
    }
    const amountSatoshis = expectPositiveInteger(obj.amountSatoshis, "amountSatoshis");
    let feeRateSatoshisPerKb: number | undefined;
    if (obj.feeRateSatoshisPerKb !== undefined)
        feeRateSatoshisPerKb = expectPositiveInteger(obj.feeRateSatoshisPerKb, "feeRateSatoshisPerKb");
    const channelId = expectPaymentChannelId(obj.channelId);
    return {
        channelId, clientRequestId, paymentType, businessKind, amountSatoshis,
        ...(feeRateSatoshisPerKb === undefined ? {} : { feeRateSatoshisPerKb }),
        recipient: paymentType === "p2pkh"
            ? { type: "p2pkh", address: expectString(recipient.address, "recipient.address") }
            : { type: "p2pk", publicKeyHex: expectString(recipient.publicKeyHex, "recipient.publicKeyHex").toLowerCase() },
    };
}

function validatePaymentStatusParams(raw: unknown): PaymentStatusParams {
    const obj = expectObject(raw, "payment.status params");
    for (const key of Object.keys(obj))
        if (key !== "clientRequestId")
            throw new ProtocolValidationError("invalid_request", "payment.status contains an unsupported field");
    const clientRequestId = expectNonEmptyString(obj.clientRequestId, "clientRequestId");
    if (clientRequestId.length > 128 || !/^[A-Za-z0-9._:-]+$/u.test(clientRequestId))
        throw new ProtocolValidationError("invalid_request", "clientRequestId is invalid");
    return { clientRequestId };
}

function expectPaymentChannelId(raw: unknown): string {
    const id = expectNonEmptyString(raw, "channelId");
    if (id.length > 96 || !/^[a-z][a-z0-9.-]+$/.test(id))
        throw new ProtocolValidationError("invalid_request", "Invalid payment channelId");
    return id;
}

function validatePaymentChannelRegisterParams(raw: unknown): PaymentChannelRegisterParams {
    const obj = expectObject(raw, "payment.channel.register params");
    const channelName = expectNonEmptyString(obj.channelName, "channelName");
    if (!/^[a-z][a-z0-9.-]{0,31}$/.test(channelName))
        throw new ProtocolValidationError("invalid_request", "Invalid channelName");
    if (obj.paymentType !== "p2pkh" && obj.paymentType !== "p2pk")
        throw new ProtocolValidationError("invalid_request", "Unsupported paymentType");
    return { channelName, paymentType: obj.paymentType };
}

/* ============== 施工单 2026-06-28 001：connect.* 校验 ============== */
/**
 * 校验 connect.login params。
 *
 * 设计缘由（施工单 2026-06-28 001 硬切换 5.1.1）：
 *   - **不**校验 ownerPublicKeyHex：owner 是用户在 popup UI 选定的，caller
 *     不在 params 里携带；service 内部从用户视图选择后写入 record。
 *   - `text` 与 `claims` 与 identity.get 同语义。
 *   - `claims` 可选；缺省 = `[]`（不返回任何 claim）。
 */
function validateConnectLoginParams(raw: unknown): ConnectLoginParams {
    const obj = expectObject(raw, "connect.login params");
    // app identity/metadata 由 Keymaster 根据 caller origin 查本地 catalog；
    // 任何自报字段都硬拒绝，避免绕过本地信任根。
    for (const key of Object.keys(obj))
        if (key !== "text" && key !== "claims" && key !== "appIdentity")
            throw new ProtocolValidationError("invalid_request", "connect.login contains an unsupported field");
    const text = expectString(obj.text, "text");
    let claims: string[] | undefined;
    if (obj.claims !== undefined) {
        if (!Array.isArray(obj.claims)) {
            throw new ProtocolValidationError("invalid_request", "claims must be an array of strings");
        }
        if (obj.claims.some((c) => typeof c !== "string"))
            throw new ProtocolValidationError("invalid_request", "claims entries must be strings");
        claims = [...obj.claims] as string[];
    }
    let appIdentity: ConnectLoginParams["appIdentity"];
    if (obj.appIdentity !== undefined) {
        try {
            verifyAppIdentityProof(obj.appIdentity);
            appIdentity = obj.appIdentity as ConnectLoginParams["appIdentity"];
        }
        catch (error) {
            throw new ProtocolValidationError("invalid_request", error instanceof AppIdentityValidationError ? error.message : "appIdentity is invalid");
        }
    }
    return { text, claims, ...(appIdentity ? { appIdentity } : {}) };
}

/**
 * 校验 connect.resume params。
 *
 * 设计缘由：resume 只接 sessionId；service 在执行路径上按 sessionId 查
 * session 记录 + 校验 origin 匹配 + 校验 owner 仍 ready。
 */
function validateConnectResumeParams(raw: unknown): ConnectResumeParams {
    const obj = expectObject(raw, "connect.resume params");
    for (const field of Object.keys(obj))
        if (field !== "appIdentity")
            throw new ProtocolValidationError("invalid_request", "connect.resume contains an unsupported field");
    let appIdentity: ConnectResumeParams["appIdentity"];
    if (obj.appIdentity !== undefined) {
        try {
            verifyAppIdentityProof(obj.appIdentity);
            appIdentity = obj.appIdentity as ConnectResumeParams["appIdentity"];
        }
        catch (error) {
            throw new ProtocolValidationError("invalid_request", error instanceof Error ? error.message : "appIdentity is invalid");
        }
    }
    return { ...(appIdentity ? { appIdentity } : {}) };
}

/**
 * 校验 connect.logout params。
 */
function validateConnectLogoutParams(raw: unknown): ConnectLogoutParams {
    const obj = expectObject(raw, "connect.logout params");
    return {};
}

/* ============== connect.launch（施工单 2026-06-29 001 硬切换） ============== */
function validateConnectLaunchParams(raw: unknown): ConnectLaunchParams {
    const obj = expectObject(raw, "connect.launch params");
    if (Object.keys(obj).some((key) => key !== "launchToken" && key !== "appIdentity")) {
        throw new ProtocolValidationError("invalid_request", "connect.launch contains an unsupported field");
    }
    const launchToken = expectNonEmptyString(obj.launchToken, "launchToken");
    if (obj.appIdentity === undefined)
        throw new ProtocolValidationError("invalid_request", "appIdentity is required");
    let appIdentity: ConnectLaunchParams["appIdentity"];
    try {
        verifyAppIdentityProof(obj.appIdentity);
        appIdentity = obj.appIdentity as ConnectLaunchParams["appIdentity"];
    }
    catch (error) {
        throw new ProtocolValidationError("invalid_request", error instanceof AppIdentityValidationError ? error.message : "appIdentity is invalid");
    }
    return { launchToken, appIdentity };
}

/* ============== channel.* validation（施工单 2026-09-02） ============== */
function validateChannelPublishParams(raw: unknown): ChannelPublishParams {
    const obj = expectObject(raw, "channel.publish params");
    requireExactKeys(obj, ["channel", "content"], "channel.publish params");
    const channel = validateExactChannel(obj.channel, "channel");
    const content = validateJsonValue(obj.content, "content");
    return { channel, content };
}

function validateChannelSubscriptionSetParams(raw: unknown): ChannelSubscriptionSetParams {
    const obj = expectObject(raw, "channel.subscription_set params");
    requireExactKeys(obj, ["channels"], "channel.subscription_set params");
    if (!Array.isArray(obj.channels)) {
        throw new ProtocolValidationError("invalid_request", "channels must be an array");
    }
    if (obj.channels.length > 64) {
        throw new ProtocolValidationError("invalid_request", "channels must contain at most 64 entries");
    }
    const channels = obj.channels.map((value, index) => validateExactChannel(value, `channels[${index}]`));
    if (new Set(channels).size !== channels.length) {
        throw new ProtocolValidationError("invalid_request", "channels must not contain duplicates");
    }
    return { channels };
}

export function validateExactChannel(value: unknown, field = "channel"): string {
    const channel = expectString(value, field);
    if (channel.length === 0 || channel === "*") {
        throw new ProtocolValidationError("invalid_request", `${field} must be a non-empty exact channel`);
    }
    if (new TextEncoder().encode(channel).byteLength > 256) {
        throw new ProtocolValidationError("invalid_request", `${field} exceeds 256 UTF-8 bytes`);
    }
    for (const codePoint of channel) {
        if (codePoint < " " || codePoint === "\u007f") {
            throw new ProtocolValidationError("invalid_request", `${field} contains a control character`);
        }
    }
    return channel;
}

function validateJsonValue(value: unknown, field: string, depth = 0): JSONValue {
    if (depth > 16)
        throw new ProtocolValidationError("invalid_request", `${field} is too deeply nested`);
    if (value === null || typeof value === "string" || typeof value === "boolean")
        return value;
    if (typeof value === "number") {
        if (!Number.isFinite(value))
            throw new ProtocolValidationError("invalid_request", `${field} contains a non-finite number`);
        return value;
    }
    if (Array.isArray(value))
        return value.map((item, index) => validateJsonValue(item, `${field}[${index}]`, depth + 1));
    if (isPlainObject(value)) {
        const output: {
            [key: string]: JSONValue;
        } = {};
        for (const [key, item] of Object.entries(value)) {
            if (key.length > 256)
                throw new ProtocolValidationError("invalid_request", `${field} contains an oversized object key`);
            // JSON 的 __proto__ 也是数据键，不能触发对象原型 setter 或丢失字段。
            Object.defineProperty(output, key, { value: validateJsonValue(item, `${field}.${key}`, depth + 1), enumerable: true, writable: true, configurable: true });
        }
        return output;
    }
    throw new ProtocolValidationError("invalid_request", `${field} must be a JSON value`);
}

function requireExactKeys(obj: Record<string, unknown>, keys: readonly string[], name: string): void {
    const actual = Object.keys(obj).sort();
    const expected = [...keys].sort();
    if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
        throw new ProtocolValidationError("invalid_request", `${name} contains unsupported fields`);
    }
}

/* ============== storage.* validation ============== */
const STORAGE_FORBIDDEN_FIELDS = [
    "publisherPublicKeyHex",
    "publisherPublicKey",
    "appId",
    "appName",
    "appIdentity",
    "namespaceRoot",
    "bucket",
    "endpoint",
    "providerId",
    "s3Key",
    "s3UploadId",
    "accessKeyId",
    "secretAccessKey"
] as const;

function storageObject(raw: unknown, name: string): Record<string, unknown> {
    const obj = expectObject(raw, name);
    for (const field of STORAGE_FORBIDDEN_FIELDS) {
        if (Object.prototype.hasOwnProperty.call(obj, field))
            throw new ProtocolValidationError("invalid_request", `${name} contains a forbidden field`);
    }
    return obj;
}

function storagePath(value: unknown, field: string, allowEmpty = false): string {
    const path = expectString(value, field);
    if (!allowEmpty && path.length === 0)
        throw new ProtocolValidationError("invalid_request", `${field} must not be empty`);
    const withoutTrailingSlash = path.endsWith("/") ? path.slice(0, -1) : path;
    if (path.length > 1024 || path.startsWith("/") || path.includes("\\") || path.includes("\0") || /[\u0000-\u001f\u007f]/u.test(path) || /[\u2044\u2215\u29f8\uff0f]/u.test(path)) {
        throw new ProtocolValidationError("invalid_request", `${field} is not a valid relative path`);
    }
    const segments = withoutTrailingSlash.split("/");
    if ((!withoutTrailingSlash && !allowEmpty) || (withoutTrailingSlash && segments.some((segment) => !segment || segment === "." || segment === ".." || segment.length > 255))) {
        throw new ProtocolValidationError("invalid_request", `${field} is not a valid relative path`);
    }
    return path;
}

function storageBinary(value: unknown, field: string): BinaryField {
    const binary = parseBinaryField(value, field);
    if (binary.bytes.byteLength > STORAGE_MAX_PAYLOAD_BYTES) {
        throw new ProtocolValidationError("storage_limit_exceeded", `${field} exceeds the maximum payload size`);
    }
    return binary;
}

function validateStorageListParams(raw: unknown): StorageListParams {
    const obj = storageObject(raw, "storage.list params");
    const prefix = obj.prefix === undefined ? "" : storagePath(obj.prefix, "prefix", true);
    const cursor = obj.cursor === undefined ? undefined : expectNonEmptyString(obj.cursor, "cursor");
    const limit = obj.limit === undefined ? STORAGE_DEFAULT_LIST_LIMIT : obj.limit;
    if (typeof limit !== "number" || !Number.isInteger(limit) || limit < 1 || limit > STORAGE_MAX_LIST_LIMIT) {
        throw new ProtocolValidationError("invalid_request", "limit must be between 1 and 1000");
    }
    return { prefix, cursor, limit };
}

function validateStorageDirectoryParams(raw: unknown, name: string, allowOverwrite: boolean): StorageDirectoryParams {
    const obj = storageObject(raw, `${name} params`);
    const path = storagePath(obj.path, "path");
    const overwrite = obj.overwrite === undefined ? undefined : obj.overwrite;
    if (overwrite !== undefined && typeof overwrite !== "boolean")
        throw new ProtocolValidationError("invalid_request", "overwrite must be boolean");
    return allowOverwrite ? { path, overwrite } : { path };
}

function validateStoragePutParams(raw: unknown): StoragePutParams {
    const obj = storageObject(raw, "storage.put params");
    const path = storagePath(obj.path, "path");
    if (path.endsWith("/"))
        throw new ProtocolValidationError("invalid_request", "object path must not end with '/'");
    const content = storageBinary(obj.content, "content");
    const contentType = obj.contentType === undefined ? undefined : expectString(obj.contentType, "contentType");
    const overwrite = obj.overwrite === undefined ? undefined : obj.overwrite;
    if (overwrite !== undefined && typeof overwrite !== "boolean")
        throw new ProtocolValidationError("invalid_request", "overwrite must be boolean");
    return { path, content, contentType, overwrite };
}

function validateStorageGetParams(raw: unknown): StorageGetParams {
    const obj = storageObject(raw, "storage.get params");
    const path = storagePath(obj.path, "path");
    if (path.endsWith("/"))
        throw new ProtocolValidationError("invalid_request", "object path must not end with '/'");
    const offset = obj.offset === undefined ? 0 : obj.offset;
    const length = obj.length === undefined ? STORAGE_MAX_PAYLOAD_BYTES : obj.length;
    if (typeof offset !== "number" || !Number.isSafeInteger(offset) || offset < 0)
        throw new ProtocolValidationError("invalid_request", "offset must be a non-negative safe integer");
    if (typeof length !== "number" || !Number.isSafeInteger(length) || length < 1 || length > STORAGE_MAX_PAYLOAD_BYTES)
        throw new ProtocolValidationError("storage_limit_exceeded", "length exceeds the maximum payload size");
    if (offset > Number.MAX_SAFE_INTEGER - (length - 1))
        throw new ProtocolValidationError("storage_limit_exceeded", "requested range exceeds safe integer bounds");
    const ifMatch = obj.ifMatch === undefined ? undefined : expectString(obj.ifMatch, "ifMatch");
    return { path, offset, length, ifMatch };
}

function validateStorageDeleteParams(raw: unknown): StorageDeleteParams {
    const obj = storageObject(raw, "storage.delete params");
    const path = storagePath(obj.path, "path");
    if (path.endsWith("/"))
        throw new ProtocolValidationError("invalid_request", "object path must not end with '/'");
    return { path };
}

/* ============== msfile.* validation（现行说明：BSV8_E2E/docs/keymaster.cc/MSFile.md） ============== */
// App 不能通过 params 注入身份、路由或金额语义；出现下列任一字段一律
// invalid_request。maxPriceSatoshis / blockIndex / fileId 等被明确禁止，
// 避免 App 绕过 Keymaster 价格策略或重建文件级访问模型。
const MSFILE_FORBIDDEN_FIELDS = [
    "maxPriceSatoshis",
    "contentKind",
    "kind",
    "fileId",
    "accessId",
    "seedAccessId",
    "blockIndex",
    "ownerPublicKeyHex",
    "publisherPublicKeyHex",
    "appId",
    "appName",
    "appIdentity",
    "identityDigestHex"
] as const;

const MSFILE_HASH_HEX_PATTERN = /^[0-9a-f]{64}$/;

function msfileObject(raw: unknown, name: string): Record<string, unknown> {
    const obj = expectObject(raw, name);
    for (const field of MSFILE_FORBIDDEN_FIELDS) {
        if (Object.prototype.hasOwnProperty.call(obj, field)) {
            throw new ProtocolValidationError("invalid_request", `${name} contains a forbidden field`);
        }
    }
    return obj;
}

function msfileHash(value: unknown, field: string): string {
    const hash = expectString(value, field);
    if (!MSFILE_HASH_HEX_PATTERN.test(hash)) {
        throw new ProtocolValidationError("msfile_invalid_hash", `${field} must be 64 lower-case hex chars`);
    }
    return hash;
}

function msfileSourceId(obj: Record<string, unknown>, name: string): string {
    const sourceId = expectString(obj.sourceId, `${name}.sourceId`);
    if (!isValidMsFileSourceId(sourceId))
        throw new ProtocolValidationError("invalid_request", "sourceId must be a valid MSFile source route");
    return sourceId;
}

function validateMsFileStatParams(raw: unknown): MsFileStatParams {
    const obj = msfileObject(raw, "msfile.stat params");
    return { seedHashHex: msfileHash(obj.seedHashHex, "seedHashHex") };
}

function validateMsFileSeedReadParams(raw: unknown): MsFileSeedReadParams {
    const obj = msfileObject(raw, "msfile.seed.read params");
    return {
        sourceId: msfileSourceId(obj, "msfile.seed.read"),
        seedHashHex: msfileHash(obj.seedHashHex, "seedHashHex")
    };
}

function validateMsFileBlockReadParams(raw: unknown): MsFileBlockReadParams {
    const obj = msfileObject(raw, "msfile.block.read params");
    return {
        sourceId: msfileSourceId(obj, "msfile.block.read"),
        seedHashHex: msfileHash(obj.seedHashHex, "seedHashHex"),
        blockHashHex: msfileHash(obj.blockHashHex, "blockHashHex")
    };
}

/* ============== helpers ============== */
/**
 * 校验主网 P2PKH 地址：base58check 解码 → 25 字节 → version 0x00。
 * testnet（version 0x6f）直接 invalid_request；本次硬切换只支持主网。
 *
 * 不做 checksum 校验：base58 解码长度 + version 足够排除绝大多数误传；
 * 真正的 chain-level 校验由 p2pkhTransferService.prepare 在签名时承担。
 */
export function assertMainnetP2pkhAddress(addr: string): void {
    assertP2pkhAddressForAsset(addr, "bsv-mainnet");
}

/**
 * 按资产校验 P2PKH 地址：mainnet version 0x00，testnet version 0x6f。
 *
 * 不做 checksum 校验：base58 解码长度 + version 足够排除绝大多数误传；
 * 真正的 chain-level 校验由 p2pkhTransferService.prepare 在签名时承担。
 */
export function assertP2pkhAddressForAsset(addr: string, assetId: P2pkhTransferAssetId): void {
    const expectedVersion = assetId === "bsv-testnet" ? 0x6f : 0x00;
    const networkLabel = assetId === "bsv-testnet" ? "testnet" : "mainnet";
    let decoded: Uint8Array;
    try {
        decoded = base58Decode(addr);
    }
    catch {
        throw new ProtocolValidationError("invalid_request", "recipientAddress is not a valid P2PKH address");
    }
    if (decoded.length !== 25) {
        throw new ProtocolValidationError("invalid_request", `recipientAddress must be a ${networkLabel} P2PKH address`);
    }
    if (decoded[0] !== expectedVersion) {
        throw new ProtocolValidationError("invalid_request", `recipientAddress must be a ${networkLabel} P2PKH address`);
    }
}

/** 33-byte compressed secp256k1 公钥 hex：66 字符，全 hex 字符。 */
export function assertCompressedPubkeyHex(hex: string): void {
    if (hex.length !== 66) {
        throw new ProtocolValidationError("invalid_request", "counterpartyPublicKeyHex must be a 33-byte compressed public key hex");
    }
    if (!/^[0-9a-fA-F]+$/.test(hex)) {
        throw new ProtocolValidationError("invalid_request", "counterpartyPublicKeyHex must be hex");
    }
}

function expectPositiveInteger(v: unknown, name: string): number {
    if (typeof v !== "number" || !Number.isInteger(v) || v <= 0) {
        throw new ProtocolValidationError("invalid_request", `${name} must be a positive integer`);
    }
    return v;
}

function expectNonEmptyString(v: unknown, name: string): string {
    if (typeof v !== "string" || v.length === 0) {
        throw new ProtocolValidationError("invalid_request", `${name} must be a non-empty string`);
    }
    return v;
}

const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

/** 最小 base58 解码（不验 checksum）。 */
function base58Decode(input: string): Uint8Array {
    if (input.length === 0)
        return new Uint8Array(0);
    const bytes: number[] = [0];
    for (const ch of input) {
        let carry = BASE58_ALPHABET.indexOf(ch);
        if (carry < 0)
            throw new Error("invalid base58");
        for (let i = 0; i < bytes.length; i++) {
            const v = bytes[i]! * 58 + carry;
            bytes[i] = v & 0xff;
            carry = (v / 256) | 0;
        }
        while (carry > 0) {
            bytes.push(carry & 0xff);
            carry = (carry / 256) | 0;
        }
    }
    let leadingZeros = 0;
    for (const ch of input) {
        if (ch === "1")
            leadingZeros++;
        else
            break;
    }
    const out = new Uint8Array(leadingZeros + bytes.length);
    for (let i = 0; i < bytes.length; i++) {
        out[out.length - 1 - i] = bytes[i]!;
    }
    return out;
}

/* ============== helpers ============== */
function isPlainObject(v: unknown): v is Record<string, unknown> {
    return typeof v === "object" && v !== null && !Array.isArray(v);
}

function expectObject(v: unknown, name: string): Record<string, unknown> {
    if (!isPlainObject(v)) {
        throw new ProtocolValidationError("invalid_request", `${name} must be an object`);
    }
    return v;
}

function expectString(v: unknown, name: string): string {
    if (typeof v !== "string") {
        throw new ProtocolValidationError("invalid_request", `${name} must be a string`);
    }
    return v;
}

function expectInteger(v: unknown, name: string): number {
    if (typeof v !== "number" || !Number.isInteger(v)) {
        throw new ProtocolValidationError("invalid_request", `${name} must be an integer`);
    }
    return v;
}

function parseBinaryField(v: unknown, name: string): BinaryField {
    if (!isPlainObject(v)) {
        throw new ProtocolValidationError("invalid_request", `${name} must be a BinaryField object`);
    }
    if (v.$type !== "binary") {
        throw new ProtocolValidationError("invalid_request", `${name} must have $type="binary"`);
    }
    if (!(v.bytes instanceof ArrayBuffer)) {
        throw new ProtocolValidationError("invalid_request", `${name}.bytes must be ArrayBuffer`);
    }
    if (v.mime !== undefined && typeof v.mime !== "string") {
        throw new ProtocolValidationError("invalid_request", `${name}.mime must be string when present`);
    }
    return { $type: "binary", bytes: v.bytes, mime: v.mime as string | undefined };
}

/** 顶层 message 形状的"只看是不是已绑定 source 会话能接受的 request"。 */
export function isStructuredCloneRequestCandidate(v: unknown): v is ProtocolRequestMessage {
    if (!isPlainObject(v))
        return false;
    if (v.v !== PROTOCOL_VERSION)
        return false;
    if (v.type !== "request")
        return false;
    if (typeof v.id !== "string")
        return false;
    if (typeof v.method !== "string")
        return false;
    return true;
}

/* ============== 施工单 003 硬切换：顶层 cancel 报文校验 ============== */
/**
 * 校验顶层 `cancel` 报文。
 *
 * 返回 `{ id }` 或抛错。**只**做结构 + id 非空字符串校验：
 *   - `v` 必须是 `PROTOCOL_VERSION`；
 *   - `type` 必须是 `"cancel"`；
 *   - `id` 必须是非空字符串。
 *
 * 设计缘由（施工单 003）：
 *   - cancel 是 transport 控制消息；除了 id 之外没有 params。
 *   - "是否生效"的判定（current binding 匹配 / source/origin 匹配 /
 *     phase === "executing" 时忽略）由 service 在 `handleMessage` 路径
 *     里集中做；validation 只负责"报文本身能不能进入 service"。
 *   - 校验失败不抛 cancel 专属 error code：复用 `invalid_request` 与
 *     其它顶层报文保持一致；popup 收到非法 cancel 直接忽略即可。
 */
export function parseCancelMessage(raw: unknown): {
    id: string;
} {
    if (!isPlainObject(raw)) {
        throw new ProtocolValidationError("invalid_request", "Cancel must be a plain object");
    }
    if (raw.v !== PROTOCOL_VERSION) {
        throw new ProtocolValidationError("invalid_request", "Unsupported protocol version");
    }
    if (raw.type !== "cancel") {
        throw new ProtocolValidationError("invalid_request", "Message type must be 'cancel'");
    }
    if (typeof raw.id !== "string" || raw.id.length === 0) {
        throw new ProtocolValidationError("invalid_request", "Cancel id is required");
    }
    return { id: raw.id };
}

/** 公开请求只含业务参数；可信钱包身份来自接收端宿主，而不是消息字段。 */
export function parseRequestMessage(raw: unknown, receiverIdentity: NetworkIdentity): { id: string; method: ProtocolMethod; params: P.MethodParams<ProtocolMethod> } {
    const value = expectObject(raw, "Request");
    if (value.v !== PROTOCOL_VERSION) throw new ProtocolValidationError("invalid_request", "Unsupported protocol version; update Connect SDK");
    if (value.type !== "request") throw new ProtocolValidationError("invalid_request", "Message type must be 'request'");
    const id = expectNonEmptyString(value.id, "Request id");
    if (["networkIdentity", "walletPublicKeyHex"].some(field => field in value)) throw new ProtocolValidationError("invalid_request", "Wallet selectors have been removed");
    if (typeof value.method !== "string") throw new ProtocolValidationError("invalid_request", "Unknown method");
    if (value.method === "feepool.prepare" || value.method === "feepool.commit" || value.method === "p2pkh.transfer") throw new ProtocolValidationError("unsupported_scope", "Method is outside Connect v1 scope");
    if (!PROTOCOL_METHODS.includes(value.method as ProtocolMethod)) throw new ProtocolValidationError("invalid_request", "Unknown method");
    const params = expectObject(value.params, "Params");
    for (const field of ["walletPublicKeyHex", "networkIdentity", "bsvNetwork", "assetId"]) {
        if (field in params) throw new ProtocolValidationError("invalid_request", `Removed wallet selector: ${field}`);
    }
    const method = value.method as ProtocolMethod;
    if (method === "payment.channel.register" && params.paymentType === "feepool.connect") throw new ProtocolValidationError("unsupported_scope", "Connect v1 does not create fee-pool channels");
    const identity = validateNetworkIdentity(receiverIdentity);
    let normalized: P.MethodParams<ProtocolMethod>;
    switch (method) {
        case "connect.login": normalized = validateConnectLoginParams(params); break;
        case "connect.resume": normalized = validateConnectResumeParams(params); break;
        case "connect.logout": normalized = validateConnectLogoutParams(params); break;
        case "connect.launch": normalized = validateConnectLaunchParams(params); break;
        case "identity.get": normalized = validateIdentityGetParams(params); break;
        case "intent.sign": normalized = validateIntentSignParams(params); break;
        case "cipher.encrypt": normalized = validateCipherEncryptParams(params); break;
        case "cipher.decrypt": normalized = validateCipherDecryptParams(params); break;
        case "payment.pay": normalized = validatePaymentPayParams(params, identity.bsvNetwork); break;
        case "payment.status": normalized = validatePaymentStatusParams(params); break;
        case "payment.channel.register": normalized = validatePaymentChannelRegisterParams(params); break;
        case "channel.publish": normalized = validateChannelPublishParams(params); break;
        case "channel.subscription_set": normalized = validateChannelSubscriptionSetParams(params); break;
        case "storage.list": normalized = validateStorageListParams(params); break;
        case "storage.directory.create": normalized = validateStorageDirectoryParams(params, method, true); break;
        case "storage.directory.delete": normalized = validateStorageDirectoryParams(params, method, false); break;
        case "storage.put": normalized = validateStoragePutParams(params); break;
        case "storage.get": normalized = validateStorageGetParams(params); break;
        case "storage.delete": normalized = validateStorageDeleteParams(params); break;
        case "msfile.stat": normalized = validateMsFileStatParams(params); break;
        case "msfile.seed.read": normalized = validateMsFileSeedReadParams(params); break;
        case "msfile.block.read": normalized = validateMsFileBlockReadParams(params); break;
        default: throw new ProtocolValidationError("unsupported_scope", "Method is outside Connect v1 scope");
    }
    return { id, method, params: normalized };
}
