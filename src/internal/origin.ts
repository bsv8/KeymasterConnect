export class OriginValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OriginValidationError";
  }
}

/** RFC 8785-compatible canonical JSON for generic vectors. */
export function canonicalizeJson(value: unknown): string {
  if (value === null || typeof value === "boolean" || typeof value === "string") {
    return JSON.stringify(value);
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new OriginValidationError("identity payload contains a non-finite number");
    }
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalizeJson).join(",")}]`;
  }
  if (typeof value === "object") {
    const object = value as Record<string, unknown>;
    const entries = Object.keys(object)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalizeJson(object[key])}`);
    return `{${entries.join(",")}}`;
  }
  throw new OriginValidationError("identity payload contains an unsupported value");
}

function parseHttpUrl(input: unknown, field: string): URL {
  if (typeof input !== "string" || !input) {
    throw new OriginValidationError(`${field} must be a non-empty string`);
  }
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    throw new OriginValidationError(`${field} is not a valid URL`);
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new OriginValidationError(`${field} must use http or https`);
  }
  if (url.username || url.password) {
    throw new OriginValidationError(`${field} must not contain credentials`);
  }
  if (url.origin === "null" || url.origin === "") {
    throw new OriginValidationError(`${field} has an opaque origin`);
  }
  if (!url.host) {
    throw new OriginValidationError(`${field} is invalid`);
  }
  return url;
}

/**
 * 从应用入口 URL 推导 canonical origin。
 * 入口可带路径/查询/片段；origin 取标准 URL origin（协议+主机+有效端口）。
 * 返回规范 origin 与保留的完整启动 URL。
 */
export function parseEntryUrl(input: unknown): { origin: string; url: string } {
  const url = parseHttpUrl(input, "url");
  return { origin: url.origin, url: url.href };
}

/**
 * 校验并规范化可信 origin 输入（WHATWG URL origin 序列化规则）。
 * 接受显式默认端口与大小写主机并归一；拒绝路径/查询/片段、凭据与非 http(s)。
 */
export function canonicalOrigin(input: unknown): string {
  const url = parseHttpUrl(input, "origin");
  if (url.pathname !== "/" && url.pathname !== "") {
    throw new OriginValidationError("origin must not contain a path");
  }
  if (url.search || url.hash) {
    throw new OriginValidationError("origin must not contain query or fragment");
  }
  // 显式默认端口与大小写主机由 URL.origin 自动归一；
  // 带路径/查询/片段的输入已在上一步拒绝，这里直接返回规范 origin。
  return url.origin;
}

/** 断言可信 origin 合法并返回规范形式。 */
export function assertCanonicalOrigin(input: unknown, field = "origin"): string {
  try {
    return canonicalOrigin(input);
  } catch (error) {
    if (error instanceof OriginValidationError) throw error;
    throw new OriginValidationError(`${field} is invalid`);
  }
}
