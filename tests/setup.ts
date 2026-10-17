import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";
import { webcrypto } from "node:crypto";

if (!crypto.subtle) Object.defineProperty(crypto, "subtle", { value: webcrypto.subtle, configurable: true });

beforeEach(() => {
  vi.stubEnv("DEEPSEEK_ENABLED", "false");
  vi.stubEnv("DEEPSEEK_VISION_ENABLED", "false");
  vi.stubEnv("DEEPSEEK_API_KEY", "synthetic-unit-key-never-real");
  vi.stubEnv("DEEPSEEK_MODEL", "deepseek-flash");
});

afterEach(() => {
  cleanup();
});
