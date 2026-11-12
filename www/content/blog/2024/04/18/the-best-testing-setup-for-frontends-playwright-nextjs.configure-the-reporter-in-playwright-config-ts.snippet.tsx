// Snippets shown on the-best-testing-setup-for-frontends-playwright-nextjs.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).

//#region configure-the-reporter-in-playwright-config-ts
export default defineConfig({
 testDir: "./src/pages",
 reporter: "list", // the 'html' reporter will open a browser window with the test results // #highlight
 // ...
})
//#endregion
