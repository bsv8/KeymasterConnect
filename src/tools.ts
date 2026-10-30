/** Connect wire v1 bidirectional AI tools. Never grants wallet payment/signing authority. */
import type { JSONValue } from "./protocol.js";

export interface AiToolSchema {
  type: "object" | "array" | "string" | "number" | "integer" | "boolean" | "null";
  description?: string;
  properties?: Record<string, AiToolSchema>;
  required?: string[];
  additionalProperties?: boolean;
  items?: AiToolSchema;
  enum?: JSONValue[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  minItems?: number;
  maxItems?: number;
}
export interface AiToolDefinition {
  /** Stable within this App, 1–40 ASCII letters/digits/underscores, starting with a letter. */
  name: string;
  description: string;
  /** Explicit supported JSON Schema subset; unsupported keywords are rejected, not ignored. */
  parameters: AiToolSchema;
}
export interface AiTool extends AiToolDefinition {
  execute(params: Record<string, JSONValue>, context: { signal: AbortSignal }): JSONValue | Promise<JSONValue>;
}
export interface AiToolsRegistered { names: string[] }
export const AI_TOOLS_MAX_JSON_CHARS = 1_000_000;
const SCHEMA_KEYS = new Set(["type", "description", "properties", "required", "additionalProperties", "items", "enum", "minimum", "maximum", "minLength", "maxLength", "minItems", "maxItems"]);
function object(value: unknown): asserts value is Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new TypeError("Expected a JSON object");
}
export function assertToolJson(value: unknown, depth = 0): asserts value is JSONValue {
  if (depth > 32) throw new TypeError("Tool JSON exceeds 32 nesting levels");
  if (value === null || typeof value === "string" || typeof value === "boolean" || (typeof value === "number" && Number.isFinite(value))) return;
  if (Array.isArray(value)) { for (const item of value) assertToolJson(item, depth + 1); return; }
  object(value);
  if (Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) throw new TypeError("Tool JSON must contain plain objects");
  for (const item of Object.values(value)) assertToolJson(item, depth + 1);
}
export function assertToolPayload(value: unknown): asserts value is JSONValue {
  assertToolJson(value);
  if (JSON.stringify(value).length > AI_TOOLS_MAX_JSON_CHARS) throw new TypeError("Tool JSON payload exceeds 1,000,000 characters");
}
function schema(value: unknown, depth = 0): asserts value is AiToolSchema {
  object(value);
  if (depth > 16 || Object.keys(value).some(key => !SCHEMA_KEYS.has(key)) || !["object", "array", "string", "number", "integer", "boolean", "null"].includes(String(value.type))) throw new TypeError("Unsupported tool schema");
  if (value.description !== undefined && (typeof value.description !== "string" || value.description.length > 4000)) throw new TypeError("Invalid schema description");
  if (value.properties !== undefined) {
    if (value.type !== "object") throw new TypeError("properties requires object type");
    object(value.properties);
    if (Object.keys(value.properties).length > 100) throw new TypeError("Too many schema properties");
    for (const [name, item] of Object.entries(value.properties)) { if (!name || name.length > 100 || ["__proto__", "constructor", "prototype"].includes(name)) throw new TypeError("Invalid schema property name"); schema(item, depth + 1); }
  }
  if (value.required !== undefined && (value.type !== "object" || !Array.isArray(value.required) || value.required.some(key => typeof key !== "string" || !Object.hasOwn(value.properties ?? {}, key)))) throw new TypeError("Invalid required properties");
  if (value.additionalProperties !== undefined && (value.type !== "object" || typeof value.additionalProperties !== "boolean")) throw new TypeError("Invalid additionalProperties");
  if (value.items !== undefined) { if (value.type !== "array") throw new TypeError("items requires array type"); schema(value.items, depth + 1); }
  if (value.type === "array" && value.items === undefined) throw new TypeError("Array schema must declare items");
  if (value.enum !== undefined) { if (!Array.isArray(value.enum) || !value.enum.length || value.enum.length > 100) throw new TypeError("Invalid enum"); assertToolJson(value.enum); }
  for (const key of ["minimum", "maximum", "minLength", "maxLength", "minItems", "maxItems"]) if (value[key] !== undefined) {
    const number = value[key];
    if (typeof number !== "number" || !Number.isFinite(number) || ((key.endsWith("Length") || key.endsWith("Items")) && (!Number.isSafeInteger(number) || number < 0))) throw new TypeError(`Invalid schema ${key}`);
    if ((key.endsWith("Length") && value.type !== "string") || (key.endsWith("Items") && value.type !== "array") || (["minimum", "maximum"].includes(key) && !["number", "integer"].includes(String(value.type)))) throw new TypeError(`Invalid schema keyword ${key}`);
  }
}
export function parseToolDefinitions(value: unknown): AiToolDefinition[] {
  assertToolPayload(value);
  if (!Array.isArray(value) || value.length > 64) throw new TypeError("Expected at most 64 tool definitions");
  const names = new Set<string>();
  for (const entry of value) {
    object(entry);
    if (Object.keys(entry).some(key => !["name", "description", "parameters"].includes(key)) || typeof entry.name !== "string" || !/^[a-zA-Z][a-zA-Z0-9_]{0,39}$/.test(entry.name) || names.has(entry.name) || typeof entry.description !== "string" || !entry.description.trim() || entry.description.length > 4000) throw new TypeError("Invalid or duplicate tool definition");
    schema(entry.parameters);
    if (entry.parameters.type !== "object") throw new TypeError("Tool parameters must be an object schema");
    names.add(entry.name);
  }
  return structuredClone(value) as unknown as AiToolDefinition[];
}
export function validateToolArguments(value: unknown, definition: AiToolSchema): asserts value is Record<string, JSONValue> {
  assertToolPayload(value);
  validate(value as JSONValue, definition);
}
function equalJson(left: JSONValue, right: JSONValue): boolean {
  if (left === right) return true;
  if (Array.isArray(left) && Array.isArray(right)) return left.length === right.length && left.every((item, index) => equalJson(item, right[index]!));
  if (!left || !right || typeof left !== "object" || typeof right !== "object" || Array.isArray(left) || Array.isArray(right)) return false;
  const keys = Object.keys(left);
  return keys.length === Object.keys(right).length && keys.every(key => Object.hasOwn(right, key) && equalJson(left[key]!, right[key]!));
}
function validate(value: JSONValue, spec: AiToolSchema): void {
  if (spec.enum && !spec.enum.some(item => equalJson(item, value))) throw new TypeError("Value is not in tool schema enum");
  switch (spec.type) {
    case "object": {
      object(value);
      for (const name of spec.required ?? []) if (!Object.hasOwn(value, name)) throw new TypeError(`Missing tool parameter: ${name}`);
      for (const [name, entry] of Object.entries(value)) {
        const child = spec.properties && Object.hasOwn(spec.properties, name) ? spec.properties[name] : undefined;
        if (child) validate(entry as JSONValue, child);
        else if (spec.additionalProperties === false) throw new TypeError(`Unknown tool parameter: ${name}`);
      }
      break;
    }
    case "array":
      if (!Array.isArray(value) || (spec.minItems !== undefined && value.length < spec.minItems) || (spec.maxItems !== undefined && value.length > spec.maxItems)) throw new TypeError("Invalid tool array");
      for (const entry of value) validate(entry, spec.items!);
      break;
    case "string": if (typeof value !== "string" || (spec.minLength !== undefined && Array.from(value).length < spec.minLength) || (spec.maxLength !== undefined && Array.from(value).length > spec.maxLength)) throw new TypeError("Invalid tool string"); break;
    case "number": case "integer": if (typeof value !== "number" || (spec.type === "integer" && !Number.isSafeInteger(value)) || (spec.minimum !== undefined && value < spec.minimum) || (spec.maximum !== undefined && value > spec.maximum)) throw new TypeError("Invalid tool number"); break;
    case "boolean": if (typeof value !== "boolean") throw new TypeError("Invalid tool boolean"); break;
    case "null": if (value !== null) throw new TypeError("Expected null"); break;
  }
}

export type AiToolMessage =
  | { v: 1; type: "tools.register"; bindingId: string; id: string; tools: AiToolDefinition[] }
  | { v: 1; type: "tools.registered"; bindingId: string; id: string; ok: true; names: string[] }
  | { v: 1; type: "tools.registered"; bindingId: string; id: string; ok: false; error: string }
  | { v: 1; type: "tools.invoke"; bindingId: string; id: string; name: string; arguments: Record<string, JSONValue> }
  | { v: 1; type: "tools.result"; bindingId: string; id: string; ok: true; result: JSONValue }
  | { v: 1; type: "tools.result"; bindingId: string; id: string; ok: false; error: string }
  | { v: 1; type: "tools.cancel"; bindingId: string; id: string };
export function isAiToolMessage(value: unknown): value is AiToolMessage {
  try {
    assertToolPayload(value); object(value);
    if (value.v !== 1 || typeof value.bindingId !== "string" || !value.bindingId || value.bindingId.length > 128 || typeof value.id !== "string" || !value.id || value.id.length > 128) return false;
    switch (value.type) {
      case "tools.register": parseToolDefinitions(value.tools); return true;
      case "tools.registered": return typeof value.ok === "boolean" && (value.ok ? Array.isArray(value.names) && value.names.length <= 64 && value.names.every(name => typeof name === "string" && name.length <= 80) : typeof value.error === "string" && value.error.length <= 1000);
      case "tools.invoke": object(value.arguments); return typeof value.name === "string" && /^[a-zA-Z][a-zA-Z0-9_]{0,39}$/.test(value.name);
      case "tools.result": return typeof value.ok === "boolean" && (value.ok ? Object.hasOwn(value, "result") : typeof value.error === "string" && value.error.length <= 1000);
      case "tools.cancel": return true;
      default: return false;
    }
  } catch { return false; }
}
