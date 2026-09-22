import { defineConfig, type UserConfig } from "vitest/config";

export function createVitestConfig(config: UserConfig): UserConfig {
  const { test, ...rest } = config;
  const { coverage, ...packageTestConfig } = test ?? {};

  return defineConfig({
    ...rest,
    test: {
      globals: true,
      environment: "happy-dom",
      ...packageTestConfig,
      coverage: {
        provider: "v8",
        reporter: ["text", "json", "html"],
        ...coverage,
      },
    },
  });
}
