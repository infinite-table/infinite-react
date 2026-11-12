// Snippets shown on the-best-testing-setup-for-frontends-playwright-nextjs.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
// `@playwright/test` is declared in the-best-testing-setup-for-frontends-playwright-nextjs.playwright-shims.d.ts
// (the snippet shows a part of playwright.config.ts, without its import)
import { defineConfig } from '@playwright/test';

//#region playwright-config-ts-configured-to-use-a-custom
export default defineConfig({
  //... other options

  // on CI, run the static server to serve the built app
  webServer: process.env.CI // #highlight
    ? {
        command: "npm run serve",
        url: "http://localhost:5432",
        reuseExistingServer: true,
        timeout: 120 * 1000,
      }
    : undefined,
})
//#endregion
