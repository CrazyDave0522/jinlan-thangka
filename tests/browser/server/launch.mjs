import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { access } from "node:fs/promises";
import { childEnvironment } from "./settings.mjs";
const mode = process.argv[2];
if (!["off", "fixture", "harness"].includes(mode)) throw new Error("Invalid browser server mode");
const preload = fileURLToPath(new URL("./upstreams.mjs", import.meta.url));
await access(preload);
const env = childEnvironment(process.env);
const nextBin = fileURLToPath(new URL("../../../node_modules/next/dist/bin/next", import.meta.url));
function run(args) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, args, { env, stdio: "inherit" });
    const stop = () => child.kill("SIGTERM");
    process.once("SIGTERM", stop); process.once("SIGINT", stop);
    child.on("exit", (code) => { process.removeListener("SIGTERM", stop); process.removeListener("SIGINT", stop); resolve(code ?? 1); });
  });
}
if (mode === "harness") process.exit(await run([fileURLToPath(new URL("../../../node_modules/vite/bin/vite.js", import.meta.url)), "--config", "tests/browser/vite.config.mts"]));
if (mode === "off") {
  const code = await run([nextBin, "build"]);
  if (code) process.exit(code);
} else env.DEEPSEEK_ENABLED = "true";
// Preload is required for both runtimes: fail closed even in the off-mode regression server.
process.exit(await run(["--import", preload, nextBin, "start", "--hostname", "127.0.0.1", "--port", mode === "off" ? "3100" : "3102"]));
