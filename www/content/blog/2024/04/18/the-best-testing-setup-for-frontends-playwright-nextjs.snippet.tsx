// Snippets shown on the-best-testing-setup-for-frontends-playwright-nextjs.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
// `@playwright/test` is declared in the-best-testing-setup-for-frontends-playwright-nextjs.playwright-shims.d.ts

//#region step-1-creating-the-nextjs-app
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ["page.tsx", "page.ts", "page.js"],
};
export default nextConfig
//#endregion

//#region example-spec-ts
import { test, expect } from "@playwright/test"; // #highlight

test("has title", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);
});
//#endregion

export {};
