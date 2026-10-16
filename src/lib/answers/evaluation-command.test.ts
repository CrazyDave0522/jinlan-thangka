// @vitest-environment node
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, it } from "vitest";
const script = new URL("../../../scripts/evaluate-answers.mjs", import.meta.url).pathname;
const directories: string[] = [];
function temporary() { const dir = mkdtempSync(join(tmpdir(), "jinlan-evaluation-command-")); directories.push(dir); return dir; }
afterEach(() => { for (const dir of directories.splice(0)) rmSync(dir, { recursive: true, force: true }); });
function execute(status: number, response: string) {
  const dir = temporary();
  const preload = join(dir, "transport.mjs");
  writeFileSync(preload, `globalThis.fetch = async (url, init) => {
    if (url !== 'http://127.0.0.1:3004/api/chat' || init.method !== 'POST') throw new Error('Unexpected transport');
    return Response.json(${response}, {status:${status}});
  };`);
  const output = execFileSync(process.execPath, ["--import", preload, script, "--allow-paid", "--port=3004"], { cwd: dir, encoding: "utf8", env: { ...process.env, DEEPSEEK_ENABLED: "false", DEEPSEEK_API_KEY: "synthetic-command-test", NODE_OPTIONS: "" } });
  const files = readdirSync(join(dir, "evaluation-results"));
  return { output, files, results: JSON.parse(readFileSync(join(dir, "evaluation-results", files[0]), "utf8")), root: readdirSync(dir) };
}
it("requires explicit authorization and a numeric loopback port before transport", () => {
  const dir = temporary();
  for (const args of [[], ["--allow-paid", "--port=https://external.test"], ["--allow-paid", "--port=65536"], ["--allow-paid", "--port=3004", "extra"]]) {
    expect(() => execFileSync(process.execPath, [script, ...args], { cwd: dir, stdio: "pipe", env: { ...process.env, NODE_OPTIONS: "" } })).toThrow();
  }
  expect(readdirSync(dir)).toEqual([]);
});
it("saves all 20 mocked cases outside the directory cleaned by browser tests", () => {
  const result = execute(200, `{message:{text:'Synthetic evaluation response'}}`);
  expect(result.results).toMatchObject({ plannedCases: 20, attempts: 20 });
  expect(result.results.results).toHaveLength(20);
  expect(result.output).toContain("Case 20/20");
  expect(result.root).toContain("evaluation-results");
  expect(result.root).not.toContain("test-results");
  expect(result.files).toHaveLength(1);
});
it("stops after an availability failure, with a checkpoint and no automatic retry", () => {
  const result = execute(503, `{error:{code:'provider_unavailable'}}`);
  expect(result.results).toMatchObject({ plannedCases: 20, attempts: 1 });
  expect(result.results.results).toHaveLength(1);
  expect(result.output).toContain("Stopping:");
});
