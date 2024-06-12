import { defineConfig } from "tsup";

export default defineConfig({
    entry: ["./src/**/*.ts"],
    skipNodeModulesBundle: true,
    clean: true
});