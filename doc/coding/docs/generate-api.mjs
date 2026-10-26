import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, renameSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
// SDK 与文档同仓；生成不再读取钱包源码或机器目录布局。
const source = resolve(root, "..");
const entryPoint = join(root, "api-entry.ts");
const tsconfig = join(root, "tsconfig.json");
if (!existsSync(entryPoint) || !existsSync(tsconfig)) {
  console.error(`找不到 Connect SDK 源码或 TypeScript 配置：${source}`);
  process.exit(1);
}

// 站点构建只读取已生成 API 页面；显式生成时读取同仓 SDK。
// 先生成到临时目录，TypeDoc 失败时保留原 API 页面和侧栏。
const temporary = mkdtempSync(join(root, "site/.api-generation-"));
const output = join(temporary, "api");
try {
  const result = spawnSync(process.execPath, [
    join(root, "node_modules/typedoc/bin/typedoc"),
    "--options", join(root, "typedoc.json"),
    "--entryPoints", entryPoint,
    "--tsconfig", tsconfig,
    "--out", output,
    // 侧栏 URL 相对于文档根生成，必须避免写入临时目录名。
    "--docsRoot", temporary
  ], { cwd: root, stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exitCode = result.status || 1;
  else {
    rmSync(join(root, "site/api"), { recursive: true, force: true });
    renameSync(output, join(root, "site/api"));
  }
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
