import { defineConfig, type Options } from "tsup";

const commonOptions: Options = {
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
};

export function createTsupConfig(options: Options): Options {
  return defineConfig({
    ...commonOptions,
    ...options,
  });
}
