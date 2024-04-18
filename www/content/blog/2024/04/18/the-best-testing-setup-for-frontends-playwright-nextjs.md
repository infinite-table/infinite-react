---
title: The best testing setup for frontends, with Playwright and NextJS
author: admin
---

We want to share with you the best testing setup we've experienced - and this includes using [Playwright](https://playwright.dev/) and [NextJS](https://nextjs.org/). It's a setup we've come up with for Infinite React DataGrid, which is a complex component, with lots of things to test, but this configuration has helped us ship with more confidence and speed.

## What you should expect from a testing setup

### Fast feedback 

⚡️ Quick ⚡️ feedback is a no-brainer, since without a fast turnaround, devs will not have the patience to run the tests and will move on to the next "burning" issue or to the next cup of coffee.

Also, you can't run all the test suite at once, so you need to be able to run only the tests that are relevant to the changes you've made. This has long been available in unit-testing frameworks, but it's not so common in end-to-end testing, when loading a webpage and rendering an actual component is involved.

In this article we want to show you how we achieved fast feedback that allows rapid developer iterations.

### Stability and predictability

You don't need flaky tests that fail randomly - it's the last thing you want when doing a release, or even during development.
Waiting for an element to appear on page or an animation to finish or an interaction to complete is a common source of flakiness in end-to-end tests, but Playwright gives you the tools to address these issues - thank you [Playwright locators](https://playwright.dev/docs/locators) 🙏 and other playwright testing framework features.

### Ease of maintenance and debugging

Another crucial point when you setup a testing framework and start writing tests is how easy is to write a new test, to inspect what is being tested and to reproduce failing tests. All these should be as easy as opening loading a URL in a browser - this is exactly what this setup gives you, with NextJS and Playwright playing very well together.
When one of your tests fails, Playwright outputs a command you can run to reproduce the exact failure and actually see the UI at the moment of the failure, with the ability to navigate through the test timeline and see what happened before the failure.

## Setting up NextJS and Playwright

### Step 1 - creating the NextJS app
```sh
$ npx create-next-app@latest
```

You're being asked a few questions. For `Would you like to use src/ directory?` we chose `Yes`. Also, we're using TypeScript.

When you run this command, make sure for this question `Would you like to use App Router?` you reply `No`, as you want to use file-system routing to make it very easy and intuitive to add new pages and tests.

<Note>
Check out our repo for this stage of the setup - [Step 1 - setting up NextJS](https://github.com/infinite-table/testing-setup-nextjs-playwright/tree/01-setup-nextjs).
</Note>

<Note>

Before you go to the next step, you can configure your `next.config.mjs` to use the `.page` extension for your pages.

```js
const nextConfig = {
  reactStrictMode: true,
  pageExtensions: ["page.tsx", "page.ts", "page.js"],
};
export default nextConfig
```

This is useful so NextJS will only compile those files as pages that your tests will be targeting, and not all the files in the `pages` folder, which will also contain your tests.

So you know all your `.page` files are pages that your tests will be run against and all your `.spec` files are tests (see next step).

</Note>

### Step 2 - setting up Playwright

```sh
$ npm init playwright@latest
```

Again a few questions about your setup.

`Where to put your end-to-end tests?` - choose `src/pages` - which makes your NextJS pages folder the place where you put your end-to-end tests.

This script installs `@playwright/test` and creates a `playwright.config.ts` file with the default configuration. Most importantly, the `testDir` is configured to `./src/pages`.

By default, all `.spec` files in the `testDir` (which is set to `src/pages`) will be run as tests.

<Note>
Check out our repo for this stage of the setup - [Step 2 - setting up Playwright](https://github.com/infinite-table/testing-setup-nextjs-playwright/tree/02-setup-playwright).
</Note>

There are some additional configurations you might want to do in this step.
You probably want to change the default `reporter` from `'html'` to `'list'` in your `playwright.config.ts` - the `'html'` reporter will open a browser window with the test results, which you might not prefer. You'd rather see the results in the terminal.

 ```ts {3} title="Configure the reporter in playwright.config.ts"
export default defineConfig({
  testDir: "./src/pages",
  reporter: "list", // the 'html' reporter will open a browser window with the test results
  // ...
})
 ```

<Note>

For now, you might want to only run your tests in one browser, so comment out any additional entries in the `projects` array in your `playwright.config.ts` file - that controls the devices that will be used in your tests.

</Note>

The last piece of the puzzle before running your first test with Playwright is defining the `test` script in your `package.json`.

```json {4} title="package.json"
{
  "name": "testing-setup-nextjs-playwright",
  "scripts": {
    "test": "npx playwright test",
    "dev": "next dev",
    "build": "next build",
  },
}
```

Executing the `npm run test` command will run the tests in the `src/pages` folder - for now, you should have a single file, `example.spec.ts`, which was generated by the `npm init playwright` command.

![Playwright test output](/blog-images/step-2-initial-results.png)

Your initial test file was something very basic. This file is importing the `test` (and `expect`) function from `@playwright/test` - and this is what you're using to define tests (and write assertions).

```ts {1} title="example.spec.ts"
import { test, expect } from "@playwright/test";

test("has title", async ({ page }) => {
  await page.goto("https://playwright.dev/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Playwright/);
});
```

### Step 3 - configuring the naming convention in Playwright to open the right pages

This step is probably the most important one in your configuration. Normally your tests will open webpages before you start testing - but this is not something you want to do explicitly in your project. Rather, you want your tests to automatically navigate to the corresponding page for the test. This is what this step is achieving - and we're using [Playwright fixtures](https://playwright.dev/docs/test-fixtures) to do this.

Think of a fixture as some code that's configuring the testing environment for each of your tests.
A fixture will extend the `test` function from `@playwright/test` with additional functionalities. Mainly, we want before every test to open the correct page, without writing this explicitly in every test. Based on the location of the test file in the file system, we want to navigate to a webpage for it and we assume it will have the same path as the test file. This is possible because NextJS is configured to use file-system routing.

```ts {1,3-5} title="Defining the fixture file - test-fixtures.ts"
import {
  test as base,
  expect,
  PlaywrightTestArgs,
  PlaywrightTestOptions,
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
```

We'll give this fixture file the name `test-fixtures.ts` and put it in the root of the project.

Now instead of importing the `test` function from `@playwright/test` we want to import it from the `test-fixtures.ts` file - we'll do this in all our tests. To make this easier, let's also define a path alias in the `tsconfig.json` file.

```json {4} title="tsconfig.json"
{
  "compilerOptions": {
    "paths": {
      "@playwright/test": ["test-fixtures.ts"],
    }
  }
}
```

We're ready to write our first test page in NextJS and use the new fixture in the Playwright test.

```tsx title="src/pages/example.page.tsx"
export default function App() {
  return <div>Hello world</div>;
}
```

```ts {1} title="src/pages/example.spec.ts"
import { test, expect } from "@testing"; // notice the import

test("Main example has corrent content", async ({ page }) => {
  // notice we don't need to navigate to the page, this is done by the fixture
  await expect(await page.innerText("body")).toContain("Hello world");
});
```

For our tests against the NextJS app, we obviously need to start the app.

Let's configure a custom port of `5432` in the package.json `dev` script.
```json {3} title="package.json"
{
  "scripts": {
    "dev": "next dev --port 5432",
    "test": "npx playwright test"
  }
  //...
}
```
We need to use the same port in the Playwright configuration file.
Also we'll use a smaller test `timeout` (the default is 30s).

```ts {9,11} title="playwright.config.ts"
import { defineConfig } from "@playwright/test";
/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./src/pages",
  reporter: "list",
  use: {
    baseURL: "http://localhost:5432/",
  },
  timeout: process.env.CI ? 10000 : 4000,
  // ... more options
});

```

We're now ready to roll!

`npm run dev` will run NextJS and `npm run test` will run the tests against your NextJS app.

<Note>

To make the setup easier, avoid using `index.page.tsx` pages in NextJS - give your pages another name, to avoid issues with directory index pages in tests. This can easily be solved in the test fixture, but for the sake of clarity and brevity we're not doing it now.

</Note>


<Note>

Check out our repo for this stage of the setup - [Step 3 - configuring the Playwright fixture and naming convention](https://github.com/infinite-table/testing-setup-nextjs-playwright/tree/03-configure-naming-convention).

</Note>

### Step 4 - adding watch mode

As we mentioned initially, no testing setup is great unless it gives you very fast feedback. For this, we obviously need watch mode.

We want to be able to re-run tests when our test code has changed, but even better, when our NextJS page has changed - so the page the test is running against.
NextJS has watch mode built-in in dev mode, so whenever a page is changed, it's recompiled and the browser is served the updated page. We'll use this in our advantage, so tests will always see the latest version of the page.
This means the last piece of the puzzle is to make Playwright re-run the tests when the page has changed or the test itself has changed.

For this, we'll use [`chokidar`](https://www.npmjs.com/package/chokidar)  - more specifically the [`chokidar-cli`](https://www.npmjs.com/package/chokidar-cli) package. `chokidar` is probably the most useful file watching library for the nodejs ecosystem and it will serve us well.

```json {4} title="package.json"
{
  "scripts": {
    "test": "npx playwright test",
    "test:watch": "chokidar '**/*.spec.ts' '**/*.page.tsx' -c 'test_file_path=$(echo {path} | sed s/page.tsx/spec.ts/) && npm run test -- --retries=0 ${test_file_path}'"
  }
}
```

The `test:watch` script is watching for changes in `.spec.ts` files and `.page.tsx` files and whenever there's a change in one of those files, it's re-running the respective test. (When a change was found in a `.page.tsx` file, we're using `sed` to replace the `.page.tsx` extension with `.spec.ts`, because we want to pass the test file to the `npm run test` command so it knows what test to re-run.)

<Note>

The above `test:watch` script was written for MacOS (and Unix-like systems). If you're using Windows, you might need to adjust the command to achieve the same result.

</Note>

<Note>

Don't forget to run `npm run dev` before running `npm run test` or `npm run test:watch` - you need the NextJS app running to be able to run the tests. After all, that's what you're testing 😅.

</Note>

### Step 5 - running tests on production build

In the last step, we want to build a production build of the NextJS app and run the tests against it. 

So first let's configure the `next.config.mjs` file to build a static site when `npm run build` is run.

```js {3} title="next.config.mjs - configured to export a static site"
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  pageExtensions: ["page.tsx", "page.ts", "page.js"],
};

export default nextConfig;
```
Notice the `"output": "export"` property. Having configured this, the `npm run build` will create an `/out` folder with the compiled assets and pages of the app.

Next we need an NPM script to serve the compiled app with a static server.

```json {3,4} title="package.json - serve script"
{
  "scripts": {
    "serve": "npx http-server --port 5432 out",
    "//...": "// other scripts"
  },
}
```

We could either run this `serve` script ourselves to start the webserver before running our tests or even better, we can instruct Playwright to [use this webserver automatically](https://playwright.dev/docs/test-webserver#configuring-a-web-server). So let's do that in our `playwright.config.ts` file.

```ts {3,5} title="playwright.config.ts - configured to use a custom server"
export default defineConfig({
  //... other options

  // on CI, run the static server to serve the built app
  webServer: process.env.CI
    ? {
        command: "npm run serve",
        url: "http://localhost:5432",
        reuseExistingServer: true,
        timeout: 120 * 1000,
      }
    : undefined,
})
```

<Note>

In order for Playwright to correctly detect the webserver is running ok, we need to make sure we have a valid index page at that address, so we need to add a `index.page.tsx` file in the `pages` folder.

```tsx title="src/pages/index.page.tsx"
export default function App() {
  return <div>Index page</div>;
}
```

This is just useful in the CI environment so that Playwright can detect the server is running and the app is served correctly.

</Note>

Next, in order to run our tests as if we're in the CI environment, let's add a `test:ci` script, which is basically calling the `test` script but setting the `CI` environment variable to `true`.

```json {3,4} title="package.json - test:ci script"
{
  "scripts": {
    "test:ci": "CI=true npm run test",
    "test": "npx playwright test",
    "serve": "npx http-server --port 5432 out",
    "//...": "// other scripts"
  },
}
```


We're now ready to run our tests against the production build of the NextJS app.

```sh
npm run build && npm run test:ci
```


This script first builds the NextJS static app and then runs the tests against it.

## Configuring CI github actions 

We're now ready to integrate our [testing workflow into CI via Github actions](https://playwright.dev/docs/ci-intro).

Create a YAML file `.github/workflows/test.yml` in the root of your project with the following content.

```yaml {19,23} title=".github/workflows/test.yml"
name: Playwright Tests
on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: lts/*
      - name: Install dependencies
        run: npm ci
      - name: Build app
        run: npm run build
      - name: Install Playwright Browsers
        run: npx playwright install --with-deps
      - name: Run Playwright tests
        run: npm run test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

With this, you're ready to go! Push your changes to the main branch and see your tests running and passing in the CI environment. Go green! 🟢

## Demo repository

You can find the full setup in our [testing-setup-nextjs-playwright repo](https://github.com/infinite-table/testing-setup-nextjs-playwright/tree/main?tab=readme-ov-file). Check it out and give it a star if you find it useful.

## Profit 🚀

With this setup, you have a very convenient way to write your tests against real pages, loaded in a real browser, just like the end user experiences. And with the watch mode giving you instant feedback, you no longer have an excuse to not write tests.

This is the same setup we've been using for developing and testing the [Infinite Table React DataGrid](https://infinite-table.com) and it has been serving us really well.

DataGrids are some of the most complex UI components one can build, so having a reliable tool that allowed us to iterate very quickly was crucial to us. This helped us add new features, while being confident that all of the existing core functionalities like row/column grouping, filtering, sorting, pagination, pivoting still work as expected.

The setup was a pivotal point in our development process and it's what gives us and our enterprise customers the peace of mind that the product is stable and reliable, both now and in the future.


