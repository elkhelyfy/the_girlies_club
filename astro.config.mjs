// @ts-check
import { defineConfig, envField } from "astro/config";
import node from "@astrojs/node";

// https://astro.build/config
export default defineConfig({
  // Every page reads from the SQLite database, so render on request.
  output: "server",
  adapter: node({ mode: "standalone" }),

  env: {
    schema: {
      // The code that unlocks /admin. Optional so the public site still runs
      // without it — /admin just stays locked until it's set.
      ADMIN_CODE: envField.string({ context: "server", access: "secret", optional: true }),
      // Where the SQLite file lives. Defaults to ./data/girlies.db.
      DATABASE_PATH: envField.string({ context: "server", access: "secret", optional: true }),
    },
  },

  vite: {
    ssr: {
      // node:sqlite is a node:-only builtin that some tooling doesn't list yet.
      external: ["node:sqlite"],
    },
  },
});
