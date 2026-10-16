import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

beforeEach(() => {
  vi.stubEnv("DEEPSEEK_ENABLED", "false");
  vi.stubEnv("DEEPSEEK_API_KEY", "synthetic-unit-key-never-real");
  vi.stubEnv("DEEPSEEK_MODEL", "deepseek-flash");
});

afterEach(() => {
  cleanup();
});
