export const syntheticEnvironment = {
  NEXT_PUBLIC_SUPABASE_URL: "https://archive.fixture.test",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_browser_fixture",
  DEEPSEEK_API_KEY: "synthetic-browser-key-never-real",
  DEEPSEEK_MODEL: "deepseek-flash",
  DEEPSEEK_ENABLED: "false",
};
export function childEnvironment(parent, enabled = false) {
  return { ...parent, ...syntheticEnvironment, DEEPSEEK_ENABLED: enabled ? "true" : "false", NODE_OPTIONS: "" };
}
