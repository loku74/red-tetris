import adapter from "@sveltejs/adapter-static";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import path from "path";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://svelte.dev/docs/kit/integrations
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter({
      // default options are shown. On some platforms
      // these options are set automatically — see below
      pages: "build",
      assets: "build",
      fallback: "index.html",
      precompress: false,
      strict: true
    }),
    output: {
      bundleStrategy: "single"
    },
    alias: {
      "@app/shared": path.resolve("../shared/index.ts")
    }
  }
};

export default config;
