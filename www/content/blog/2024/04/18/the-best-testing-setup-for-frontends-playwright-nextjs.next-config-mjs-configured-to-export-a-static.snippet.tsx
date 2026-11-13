// Snippets shown on the-best-testing-setup-for-frontends-playwright-nextjs.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).

//#region next-config-mjs-configured-to-export-a-static
const nextConfig = {
  reactStrictMode: true,
  output: "export", // #highlight
  pageExtensions: ["page.tsx", "page.ts", "page.js"],
};

export default nextConfig;
//#endregion
