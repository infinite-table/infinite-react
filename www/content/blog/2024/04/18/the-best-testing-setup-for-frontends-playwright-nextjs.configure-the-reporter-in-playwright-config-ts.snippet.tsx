// Snippets shown on the-best-testing-setup-for-frontends-playwright-nextjs.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
// `@playwright/test` is declared in the-best-testing-setup-for-frontends-playwright-nextjs.playwright-shims.d.ts
// (the snippet shows a part of playwright.config.ts, without its import)
import { defineConfig } from '@playwright/test';

//#region configure-the-reporter-in-playwright-config-ts
export default defineConfig({
 testDir: "./src/pages",
 reporter: "list", // the 'html' reporter will open a browser window with the test results // #highlight
 // ...
})
//#endregion
