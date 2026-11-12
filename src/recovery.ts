/** 浏览器刷新恢复记录：只保存最近一次成功连接的可恢复引用，不保存业务材料。 */
import {
  validateNetworkIdentity,
  type NetworkIdentity,
} from "./protocol.js";
import type { KeymasterConnectMode } from "./client.js";

/** sessionStorage 下唯一的恢复记录键。 */
export const RECOVERY_STORAGE_KEY = "keymaster-connect:recovery:v1";

/** 本地持久的完整恢复记录（含不透明授权引用，不向 UI 公开）。 */
export interface ConnectionRecoveryRecord {
  version: 1;
  targetOrigin: string;
  mode: KeymasterConnectMode;
  authorizationId: string;
  networkIdentity: NetworkIdentity;
}

/** 公开给应用的恢复摘要，不含凭据。 */
export interface ConnectionRecoverySummary {
  version: 1;
  targetOrigin: string;
  mode: KeymasterConnectMode;
  networkIdentity: NetworkIdentity;
}

/** 可替换的存储适配器；默认实现访问 sessionStorage，不自动降级到 localStorage。 */
export interface ConnectionRecoveryStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

function normalizeExactOrigin(input: string): string | null {
  try {
    const url = new URL(input);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (url.origin !== input) return null;
    return url.origin;
  } catch {
    return null;
  }
}

function isMode(value: unknown): value is KeymasterConnectMode {
  return value === "iframe" || value === "appView" || value === "popup";
}

function parseRecord(raw: unknown): ConnectionRecoveryRecord | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const value = raw as Record<string, unknown>;
  if (value.version !== 1) return null;
  if (typeof value.targetOrigin !== "string" || normalizeExactOrigin(value.targetOrigin) === null) return null;
  if (!isMode(value.mode)) return null;
  if (typeof value.authorizationId !== "string" || !value.authorizationId || value.authorizationId.length > 128) return null;
  try {
    const identity = validateNetworkIdentity(value.networkIdentity);
    return {
      version: 1,
      targetOrigin: value.targetOrigin,
      mode: value.mode,
      authorizationId: value.authorizationId,
      networkIdentity: { ...identity },
    };
  } catch {
    return null;
  }
}

/** 解析默认 sessionStorage；不可用时返回 null，不抛错、不降级。 */
export function resolveRecoveryStorage(explicit?: ConnectionRecoveryStorage): ConnectionRecoveryStorage | null {
  if (explicit) return explicit;
  try {
    if (typeof sessionStorage === "undefined") return null;
    // 可用性探测：只读不断言，避免在隐私模式下抛错影响登录。
    sessionStorage.getItem(RECOVERY_STORAGE_KEY);
    return sessionStorage;
  } catch {
    return null;
  }
}

/** 存储是否可用（可用不代表已有记录）。 */
export function isRecoveryStorageAvailable(storage?: ConnectionRecoveryStorage): boolean {
  return resolveRecoveryStorage(storage) !== null;
}

function readStoredRecord(storage: ConnectionRecoveryStorage | null): ConnectionRecoveryRecord | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(RECOVERY_STORAGE_KEY);
    if (!raw) return null;
    return parseRecord(JSON.parse(raw));
  } catch {
    return null;
  }
}

export interface ReadRecoveryInit {
  recoveryStorage?: ConnectionRecoveryStorage;
  targetOrigin?: string;
  mode?: KeymasterConnectMode;
}

/**
 * 读取恢复摘要供应用在创建 client 前展示，不向 UI 暴露凭据。
 * 提供 targetOrigin/mode 时只在完全相符时返回，否则返回 null。
 */
export function readConnectionRecovery(init?: ReadRecoveryInit): ConnectionRecoverySummary | null {
  const storage = resolveRecoveryStorage(init?.recoveryStorage);
  const record = readStoredRecord(storage);
  if (!record) return null;
  if (init?.targetOrigin !== undefined) {
    const expected = normalizeExactOrigin(init.targetOrigin);
    if (!expected || record.targetOrigin !== expected) return null;
  }
  if (init?.mode !== undefined && record.mode !== init.mode) return null;
  return {
    version: 1,
    targetOrigin: record.targetOrigin,
    mode: record.mode,
    networkIdentity: { ...record.networkIdentity },
  };
}

/** 供 client.resume() 内部装载完整凭据；不直接设置为已登录。 */
export function loadConnectionRecoveryRecord(init: {
  recoveryStorage?: ConnectionRecoveryStorage;
  targetOrigin: string;
  mode: KeymasterConnectMode;
}): ConnectionRecoveryRecord | null {
  const expectedOrigin = normalizeExactOrigin(init.targetOrigin);
  if (!expectedOrigin || !isMode(init.mode)) return null;
  const storage = resolveRecoveryStorage(init.recoveryStorage);
  const record = readStoredRecord(storage);
  if (!record) return null;
  if (record.targetOrigin !== expectedOrigin || record.mode !== init.mode) return null;
  return record;
}

/** 保存最近一次成功连接的恢复记录；写入失败时抛错，由调用方决定提示。 */
export function saveConnectionRecoveryRecord(
  storage: ConnectionRecoveryStorage | null,
  record: ConnectionRecoveryRecord
): void {
  if (!storage) throw new Error("Recovery storage is unavailable");
  const parsed = parseRecord(record);
  if (!parsed) throw new TypeError("Invalid recovery record");
  storage.setItem(RECOVERY_STORAGE_KEY, JSON.stringify(parsed));
}

export interface ClearRecoveryInit {
  recoveryStorage?: ConnectionRecoveryStorage;
  targetOrigin?: string;
  authorizationId?: string;
}

/**
 * 主动清除本地恢复记录，只删除本地材料，不代表钱包授权已撤销。
 * 提供 targetOrigin/authorizationId 时仅在完全相符时删除，避免旧实例误删新记录。
 * 返回 true 表示已删除。
 */
export function clearConnectionRecovery(init?: ClearRecoveryInit): boolean {
  const storage = resolveRecoveryStorage(init?.recoveryStorage);
  if (!storage) return false;
  try {
    const current = readStoredRecord(storage);
    if (!current) {
      try {
        storage.removeItem(RECOVERY_STORAGE_KEY);
      } catch {
        // 忽略删除失败：保留语义由调用方决定。
      }
      return false;
    }
    if (init?.targetOrigin !== undefined) {
      const expected = normalizeExactOrigin(init.targetOrigin);
      if (!expected || current.targetOrigin !== expected) return false;
    }
    if (init?.authorizationId !== undefined && current.authorizationId !== init.authorizationId) return false;
    storage.removeItem(RECOVERY_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}
