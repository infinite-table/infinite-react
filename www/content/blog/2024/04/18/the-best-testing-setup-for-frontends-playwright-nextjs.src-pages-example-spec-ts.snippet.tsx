// Snippets shown on the-best-testing-setup-for-frontends-playwright-nextjs.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).
// `@testing` (the post's alias for its fixture file) is declared in
// the-best-testing-setup-for-frontends-playwright-nextjs.playwright-shims.d.ts

//#region src-pages-example-spec-ts
import { test, expect } from "@testing"; // notice the import // #highlight

test("Main example has corrent content", async ({ page }) => {
  // notice we don't need to navigate to the page, this is done by the fixture
  await expect(await page.innerText("body")).toContain("Hello world");
});
//#endregion
