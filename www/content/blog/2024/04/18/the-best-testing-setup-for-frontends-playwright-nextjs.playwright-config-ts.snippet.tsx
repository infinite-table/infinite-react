// Snippets shown on the-best-testing-setup-for-frontends-playwright-nextjs.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).

//#region playwright-config-ts
import { defineConfig } from "@playwright/test";
/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./src/pages",
  reporter: "list",
  use: {
    baseURL: "http://localhost:5432/", // #highlight
  },
  timeout: process.env.CI ? 10000 : 4000, // #highlight
  // ... more options
});
//#endregion
