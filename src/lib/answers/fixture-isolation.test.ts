// @vitest-environment node
import { execFileSync } from "node:child_process";
import { expect, it } from "vitest";
import { childEnvironment, syntheticEnvironment } from "../../../tests/browser/server/settings.mjs";
const preload = new URL("../../../tests/browser/server/upstreams.mjs", import.meta.url).pathname;
function run(code: string, env = childEnvironment(process.env, true), path = preload) {
  return execFileSync(process.execPath, ["--import", path, "--input-type=module", "-e", code], { env, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
}
it("overrides inherited private/public settings and NODE_OPTIONS before child startup", () => {
  const env = childEnvironment({ DEEPSEEK_API_KEY: "real-looking-but-synthetic-parent-value", DEEPSEEK_ENABLED: "true", NEXT_PUBLIC_SUPABASE_URL: "https://unwanted.test", NODE_OPTIONS: "--unwanted-preload" });
  expect(env).toMatchObject(syntheticEnvironment); expect(env.NODE_OPTIONS).toBe("");
});
it("fails closed for unsafe settings and missing preload", () => {
  expect(() => run("", { ...childEnvironment(process.env, true), DEEPSEEK_API_KEY: "wrong" })).toThrow();
  expect(() => run("", childEnvironment(process.env, true), `${preload}.missing`)).toThrow();
});
it("blocks outbound network and any provider call in off mode", () => {
  expect(run(`try { await fetch('https://nonallowlisted.test'); process.exit(9); } catch { process.stdout.write('blocked'); }`)).toBe("blocked");
  expect(run(`try { await fetch('https://api.deepseek.com/chat/completions'); process.exit(9); } catch { process.stdout.write('blocked'); }`, childEnvironment(process.env))).toBe("blocked");
});
it("keeps ordinary builds on the production manifest and fails closed for mixed fixture/real settings", () => {
  const config = new URL("../../../next.config.ts", import.meta.url).href;
  const inspect = (env: Record<string, string | undefined>) => execFileSync(process.execPath, ["--input-type=module", "-e", `const {default:c}=await import(${JSON.stringify(config)}); process.stdout.write(c.turbopack.resolveAlias ? 'synthetic' : 'production');`], { env: { ...env, NODE_ENV: "test" }, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
  const env = childEnvironment(process.env);
  expect(inspect({ ...env, JINLAN_BROWSER_FIXTURES: "false" })).toBe("production");
  expect(inspect(env)).toBe("synthetic");
  expect(() => inspect({ ...env, NEXT_PUBLIC_SUPABASE_URL: "https://unwanted.test" })).toThrow();
});
