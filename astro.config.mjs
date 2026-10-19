// @ts-check
import { defineConfig, envField } from "astro/config";
import netlify from "@astrojs/netlify";

// https://astro.build/config
export default defineConfig({
  // Every page reads from Netlify Database, so render on request.
  output: "server",
  adapter: netlify(),

  env: {
    schema: {
      // The code that unlocks /admin. Optional so the public site still runs
      // without it — /admin just stays locked until it's set.
      ADMIN_CODE: envField.string({ context: "server", access: "secret", optional: true }),
    },
  },
});
