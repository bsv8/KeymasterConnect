import { secp256k1 } from "@noble/curves/secp256k1.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex, concatBytes, hexToBytes } from "@noble/hashes/utils.js";
import type { ChainOutpoint, PaymentDataSignature, PaymentOutput } from "./protocol.js";

const utf8 = new TextEncoder();
const compactSize = 64;

function head(major: number, size: number): Uint8Array {
  const prefix = major << 5;
  if (size < 24) return Uint8Array.of(prefix | size);
  if (size <= 0xff) return Uint8Array.of(prefix | 24, size);
  if (size <= 0xffff) return Uint8Array.of(prefix | 25, size >>> 8, size);
  const bytes = new Uint8Array(5);
  bytes[0] = prefix | 26;
  new DataView(bytes.buffer).setUint32(1, size);
  return bytes;
}

export function validateApplicationPurpose(purpose: string): string {
  const bytes = utf8.encode(purpose);
  if (!bytes.length || bytes.length > 255 || new TextDecoder("utf-8", { ignoreBOM: true }).decode(bytes) !== purpose) {
    throw new Error("Invalid application purpose");
  }
  return purpose;
}

export function applicationKeyTweak(purpose: string, publicKeyHex: string): bigint {
  const label = utf8.encode(validateApplicationPurpose(purpose));
  const publicKey = hexToBytes(publicKeyHex);
  if (publicKey.length !== 33) throw new Error("Expected a compressed wallet public key");
  secp256k1.Point.fromBytes(publicKey);
  const hash = sha256(concatBytes(Uint8Array.of(0x82), head(3, label.length), label, head(2, publicKey.length), publicKey));
  const tweak = BigInt("0x" + bytesToHex(hash)) % secp256k1.Point.Fn.ORDER;
  if (tweak === 0n) throw new Error("Application key derivation failed");
  return tweak;
}

export function applicationPublicKey(purpose: string, publicKeyHex: string): string {
  const point = secp256k1.Point.fromHex(publicKeyHex).add(secp256k1.Point.BASE.multiply(applicationKeyTweak(purpose, publicKeyHex)));
  if (point.is0()) throw new Error("Application key derivation failed");
  return point.toHex(true);
}

export function applicationMessageDigest(purpose: string, message: Uint8Array): Uint8Array {
  const label = utf8.encode(validateApplicationPurpose(purpose));
  return sha256(concatBytes(utf8.encode("keymaster.application-message.v1"), head(3, label.length), label, sha256(message)));
}

/** The reserved inputs are inserted as deterministic CBOR [[display-order txid, vout], ...]. */
export function paymentSigningObject(template: PaymentDataSignature, inputs: readonly ChainOutpoint[]): Uint8Array {
  const encoded = inputs.map(({ txid, vout }) => {
    const id = hexToBytes(txid);
    if (id.length !== 32 || !Number.isInteger(vout) || vout < 0 || vout > 0xffffffff) throw new Error("Invalid payment outpoint");
    return concatBytes(Uint8Array.of(0x82, 0x58, 0x20), id, head(0, vout));
  });
  return concatBytes(hexToBytes(template.prefixHex), head(4, inputs.length), ...encoded, hexToBytes(template.suffixHex));
}

/** Only a fixed-size zero-filled span inside one zero-value data push can be filled. */
export function assertPaymentSignatureSlot(outputs: readonly PaymentOutput[], template: PaymentDataSignature): void {
  const output = outputs[template.outputIndex];
  if (!output || output.amount !== 0) throw new Error("Signature output must have zero value");
  const script = hexToBytes(output.script);
  const push = script[2] ?? 0;
  const pushSize = push <= 75 ? 0 : push === 0x4c ? 1 : push === 0x4d ? 2 : push === 0x4e ? 4 : -1;
  const start = 3 + pushSize;
  if (script[0] !== 0 || script[1] !== 0x6a || pushSize < 0 || start > script.length) throw new Error("Expected a data output with a single push");
  const length = pushSize ? script.subarray(3, start).reduceRight((size, byte) => size * 256 + byte, 0) : push;
  if (!Number.isSafeInteger(template.offset) || start + length !== script.length ||
      template.offset < start || template.offset + compactSize > script.length ||
      script.subarray(template.offset, template.offset + compactSize).some(byte => byte !== 0)) {
    throw new Error("Invalid compact signature slot");
  }
}
