// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import { getSupabaseConfig } from "@/lib/supabase/config";

describe("getSupabaseConfig", () => {
  it("returns the configured public project URL and key", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "test-publishable-key");

    expect(getSupabaseConfig()).toEqual({
      url: "https://example.supabase.co",
      key: "test-publishable-key",
    });
  });

  it.each([
    ["", "test-publishable-key"],
    ["https://example.supabase.co", ""],
    ["", ""],
  ])("rejects incomplete configuration (%s, %s)", (url, key) => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", url);
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", key);

    expect(() => getSupabaseConfig()).toThrow(
      "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    );
  });
});
