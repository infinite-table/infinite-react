// Snippets shown on the-best-testing-setup-for-frontends-playwright-nextjs.page.md, one `#region` per code block.
// Type-checked against the library source (`npm run tsc:content`).

//#region defining-the-fixture-file-test-fixtures-ts
import { // #highlight
  test as base,
  // #highlight
  expect,
  PlaywrightTestArgs,
  PlaywrightTestOptions,
  // #endhighlight
  Page,
} from "@playwright/test";

export * from "@playwright/test";

export const test = base.extend<
  PlaywrightTestArgs &
    PlaywrightTestOptions
>({
  //@ts-ignore
  page: async ({ baseURL, page }, use, testInfo) => {
    const testFilePath = testInfo.titlePath[0];
    const fileName = testFilePath.replace(".spec.ts", "");
    const url = `${baseURL}${fileName}`;

    // navigate to the corresponding page for this test
    await page.goto(url);

    await use(page);
  },
});
//#endregion
