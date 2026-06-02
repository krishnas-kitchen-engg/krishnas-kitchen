import { fileURLToPath, URL } from "node:url";
import { mergeConfig } from "vite";
import { defineConfig } from "vitest/config";

import { sharedVitestConfig } from "../../vitest.shared";
import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  mergeConfig(
    sharedVitestConfig,
    defineConfig({
      test: {
        name: "web",
        root: fileURLToPath(new URL(".", import.meta.url))
      }
    })
  )
);
