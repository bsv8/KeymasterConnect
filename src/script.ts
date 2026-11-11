/** Connect v1 业务脚本解释：只做展示，不决定是否允许支付。 */
import { sha256 } from "@noble/hashes/sha2.js";
import { ripemd160 } from "@noble/hashes/legacy.js";
import type { PaymentOutput } from "./protocol.js";

export type PaymentScriptKind = "p2pkh" | "p2pk" | "multisig" | "op_return" | "unknown";

export interface PaymentScriptP2pkh {
  kind: "p2pkh";
  scriptHex: string;
  amountSats: number;
  hash160Hex: string;
  addressMainnet: string;
  addressTestnet: string;
  summary: string;
}

export interface PaymentScriptP2pk {
  kind: "p2pk";
  scriptHex: string;
  amountSats: number;
  publicKeyHex: string;
  summary: string;
}

export interface PaymentScriptMultisig {
  kind: "multisig";
  scriptHex: string;
  amountSats: number;
  m: number;
  n: number;
  publicKeysHex: string[];
  summary: string;
}

export interface PaymentScriptOpReturn {
  kind: "op_return";
  scriptHex: string;
  amountSats: number;
  dataHex: string;
  dataText: string;
  summary: string;
}

export interface PaymentScriptUnknown {
  kind: "unknown";
  scriptHex: string;
  amountSats: number;
  reason: string;
  summary: string;
}

export type PaymentScriptInterpretation =
  | PaymentScriptP2pkh
  | PaymentScriptP2pk
  | PaymentScriptMultisig
  | PaymentScriptOpReturn
  | PaymentScriptUnknown;

export interface InterpretedPaymentOutput {
  index: number;
  amountSats: number;
  scriptHex: string;
  interpretation: PaymentScriptInterpretation;
}

function hexToBytes(hex: string): Uint8Array | null {
  if (hex.length % 2 !== 0 || (hex.length > 0 && !/^[0-9a-fA-F]+$/u.test(hex))) return null;
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return out;
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function base58Encode(bytes: Uint8Array): string {
  if (bytes.length === 0) return "";
  const digits: number[] = [0];
  for (const byte of bytes) {
    let carry = byte;
    for (let i = 0; i < digits.length; i++) {
      const v = digits[i]! * 256 + carry;
      digits[i] = v % 58;
      carry = Math.floor(v / 58);
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = Math.floor(carry / 58);
    }
  }
  let leadingZeros = 0;
  for (const b of bytes) {
    if (b === 0) leadingZeros++;
    else break;
  }
  let result = "1".repeat(leadingZeros);
  for (let i = digits.length - 1; i >= 0; i--) result += BASE58_ALPHABET[digits[i]!];
  return result;
}

function p2pkhAddress(hash160: Uint8Array, version: number): string {
  const payload = new Uint8Array(1 + hash160.length);
  payload[0] = version;
  payload.set(hash160, 1);
  const checksum = sha256(sha256(payload)).slice(0, 4);
  const full = new Uint8Array(payload.length + 4);
  full.set(payload, 0);
  full.set(checksum, payload.length);
  return base58Encode(full);
}

function hash160Of(data: Uint8Array): Uint8Array {
  return ripemd160(sha256(data));
}

function decodeText(bytes: Uint8Array): string {
  try {
    return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  } catch {
    return "";
  }
}

function parsePushes(bytes: Uint8Array, offset: number): { pushes: Uint8Array[]; consumed: number } | null {
  const pushes: Uint8Array[] = [];
  let pos = offset;
  while (pos < bytes.length) {
    const op = bytes[pos]!;
    if (op >= 0x01 && op <= 0x4b) {
      const len = op;
      if (pos + 1 + len > bytes.length) return null;
      pushes.push(bytes.slice(pos + 1, pos + 1 + len));
      pos += 1 + len;
    } else if (op === 0x4c) {
      if (pos + 2 > bytes.length) return null;
      const len = bytes[pos + 1]!;
      if (pos + 2 + len > bytes.length) return null;
      pushes.push(bytes.slice(pos + 2, pos + 2 + len));
      pos += 2 + len;
    } else if (op === 0x4d) {
      if (pos + 3 > bytes.length) return null;
      const len = bytes[pos + 1]! | (bytes[pos + 2]! << 8);
      if (pos + 3 + len > bytes.length) return null;
      pushes.push(bytes.slice(pos + 3, pos + 3 + len));
      pos += 3 + len;
    } else if (op === 0x4e) {
      if (pos + 5 > bytes.length) return null;
      const len = bytes[pos + 1]! | (bytes[pos + 2]! << 8) | (bytes[pos + 3]! << 16) | (bytes[pos + 4]! * 0x1000000);
      if (len < 0 || pos + 5 + len > bytes.length) return null;
      pushes.push(bytes.slice(pos + 5, pos + 5 + len));
      pos += 5 + len;
    } else if (op === 0x00) {
      pushes.push(new Uint8Array(0));
      pos += 1;
    } else if (op >= 0x51 && op <= 0x60) {
      // OP_1..OP_16 are not data pushes for OP_RETURN payload parsing;
      // treat as terminator for generic push parsing.
      return null;
    } else {
      return null;
    }
  }
  return { pushes, consumed: pos };
}

function isCompressedPubkey(bytes: Uint8Array): boolean {
  return bytes.length === 33 && (bytes[0] === 0x02 || bytes[0] === 0x03);
}

function isUncompressedPubkey(bytes: Uint8Array): boolean {
  return bytes.length === 65 && bytes[0] === 0x04;
}

function isPubkey(bytes: Uint8Array): boolean {
  return isCompressedPubkey(bytes) || isUncompressedPubkey(bytes);
}

function unknown(scriptHex: string, amountSats: number): PaymentScriptUnknown {
  return {
    kind: "unknown",
    scriptHex,
    amountSats,
    reason: "不认识此脚本，无法解释其用途",
    summary: "不认识此脚本，无法解释其用途",
  };
}

/** 解释单个 locking script；匹配必须完整，失败按未知脚本展示。 */
export function interpretLockingScript(scriptHexRaw: string, amountSats: number): PaymentScriptInterpretation {
  const scriptHex = scriptHexRaw.toLowerCase();
  const bytes = hexToBytes(scriptHex);
  if (!bytes) return unknown(scriptHex, amountSats);
  // P2PKH: 76 a9 14 <20> 88 ac
  if (bytes.length === 25 && bytes[0] === 0x76 && bytes[1] === 0xa9 && bytes[2] === 0x14 && bytes[23] === 0x88 && bytes[24] === 0xac) {
    const hash = bytes.slice(3, 23);
    const hashHex = bytesToHex(hash);
    return {
      kind: "p2pkh",
      scriptHex,
      amountSats,
      hash160Hex: hashHex,
      addressMainnet: p2pkhAddress(hash, 0x00),
      addressTestnet: p2pkhAddress(hash, 0x6f),
      summary: `P2PKH 收款地址 ${p2pkhAddress(hash, 0x00)} / ${p2pkhAddress(hash, 0x6f)}，金额 ${amountSats} sat`,
    };
  }
  // P2PK: <pubkey> OP_CHECKSIG
  if (bytes.length >= 2 && bytes[bytes.length - 1] === 0xac) {
    const pushOp = bytes[0]!;
    const pubLen = (pushOp >= 0x01 && pushOp <= 0x4b) ? pushOp : -1;
    if (pubLen > 0 && bytes.length === 1 + pubLen + 1) {
      const pub = bytes.slice(1, 1 + pubLen);
      if (isPubkey(pub)) {
        const pubHex = bytesToHex(pub);
        return {
          kind: "p2pk",
          scriptHex,
          amountSats,
          publicKeyHex: pubHex,
          summary: `P2PK 收款公钥 ${pubHex}，金额 ${amountSats} sat`,
        };
      }
    }
  }
  // 标准多签: OP_m <pubkey>* OP_n OP_CHECKMULTISIG
  if (bytes.length >= 3 && bytes[bytes.length - 1] === 0xae) {
    const mOp = bytes[0]!;
    const nOp = bytes[bytes.length - 2]!;
    if (mOp >= 0x51 && mOp <= 0x60 && nOp >= 0x51 && nOp <= 0x60) {
      const m = mOp - 0x50;
      const n = nOp - 0x50;
      // 中间必须全是 push，且数量 == n
      let pos = 1;
      const pubs: Uint8Array[] = [];
      let ok = true;
      for (let i = 0; i < n; i++) {
        if (pos >= bytes.length - 2) { ok = false; break; }
        const op = bytes[pos]!;
        let len = -1;
        let header = 1;
        if (op >= 0x01 && op <= 0x4b) { len = op; header = 1; }
        else { ok = false; break; }
        if (pos + header + len > bytes.length - 2) { ok = false; break; }
        const pub = bytes.slice(pos + header, pos + header + len);
        if (!isPubkey(pub)) { ok = false; break; }
        pubs.push(pub);
        pos += header + len;
      }
      if (ok && pubs.length === n && pos === bytes.length - 2 && m >= 1 && m <= n && n >= 1 && n <= 16) {
        const hexes = pubs.map(bytesToHex);
        return {
          kind: "multisig",
          scriptHex,
          amountSats,
          m,
          n,
          publicKeysHex: hexes,
          summary: `标准多签 ${m}/${n}，公钥 ${hexes.join(", ")}，金额 ${amountSats} sat`,
        };
      }
    }
  }
  // OP_RETURN / OP_FALSE OP_RETURN
  {
    let dataStart = -1;
    if (bytes.length >= 1 && bytes[0] === 0x6a) dataStart = 1;
    else if (bytes.length >= 2 && bytes[0] === 0x00 && bytes[1] === 0x6a) dataStart = 2;
    if (dataStart >= 0) {
      const rest = bytes.slice(dataStart);
      if (rest.length === 0) {
        return {
          kind: "op_return",
          scriptHex,
          amountSats,
          dataHex: "",
          dataText: "",
          summary: `数据输出，空数据，金额 ${amountSats} sat`,
        };
      }
      const parsed = parsePushes(rest, 0);
      if (parsed && parsed.consumed === rest.length) {
        const combined = parsed.pushes.reduce((acc, cur) => {
          const next = new Uint8Array(acc.length + cur.length);
          next.set(acc, 0);
          next.set(cur, acc.length);
          return next;
        }, new Uint8Array(0));
        const dataHex = bytesToHex(combined);
        const dataText = decodeText(combined);
        return {
          kind: "op_return",
          scriptHex,
          amountSats,
          dataHex,
          dataText,
          summary: `数据输出，数据 ${dataHex || "(空)"}，金额 ${amountSats} sat`,
        };
      }
      // 剩余字节不是标准 push：按未知处理，避免误导性解释。
      return unknown(scriptHex, amountSats);
    }
  }
  return unknown(scriptHex, amountSats);
}

/** 按 App 顺序逐项解释业务输出。 */
export function interpretPaymentOutputs(outputs: PaymentOutput[]): InterpretedPaymentOutput[] {
  return outputs.map((output, index) => ({
    index,
    amountSats: output.amount,
    scriptHex: output.script.toLowerCase(),
    interpretation: interpretLockingScript(output.script, output.amount),
  }));
}

/** 业务输出总额（不含矿工费与找零）。 */
export function totalBusinessSats(outputs: PaymentOutput[]): number {
  let total = 0;
  for (const output of outputs) total += output.amount;
  return total;
}
