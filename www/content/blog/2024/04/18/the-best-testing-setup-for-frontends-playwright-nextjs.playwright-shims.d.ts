// Not shown on the page: type declarations for the modules that the snippets of
// the-best-testing-setup-for-frontends-playwright-nextjs.page.md import.
//
// The post is about Playwright, which isn't a dependency of the docs site, so
// `@playwright/test` is declared here - only the part of its API that the post
// uses, with the names and shapes of the real typings. `@testing` is the alias
// the post gives to its own fixture file (test-fixtures.ts).
//
// This file must stay a script (no top-level import / export): in a module,
// `declare module` can only augment a module that resolves.

declare module '@playwright/test' {
  export interface Page {
    goto(url: string): Promise<unknown>;
    innerText(selector: string): Promise<string>;
  }

  export interface TestInfo {
    /** The file of the test, then the titles of its describe blocks and its own title */
    titlePath: string[];
  }

  export interface PlaywrightTestArgs {
    page: Page;
  }

  export interface PlaywrightTestOptions {
    baseURL: string | undefined;
  }

  export type TestFixture<Value, Args> = (
    args: Args,
    use: (value: Value) => Promise<void>,
    testInfo: TestInfo,
  ) => Promise<void> | void;

  export type Fixtures<T, Args> = {
    [K in keyof T]?: T[K] | TestFixture<T[K], Args & T>;
  };

  export interface TestType<Args> {
    (
      title: string,
      body: (args: Args, testInfo: TestInfo) => Promise<void> | void,
    ): void;
    extend<T>(fixtures: Fixtures<T, Args>): TestType<Args & T>;
  }

  export const test: TestType<PlaywrightTestArgs & PlaywrightTestOptions>;

  export interface PageAssertions {
    toHaveTitle(titleOrRegExp: string | RegExp): Promise<void>;
  }

  export interface GenericAssertions {
    toContain(expected: unknown): void;
  }

  export interface Expect {
    (actual: Page): PageAssertions;
    (actual: unknown): GenericAssertions;
  }

  export const expect: Expect;

  export interface PlaywrightTestConfig {
    testDir?: string;
    reporter?: 'list' | 'dot' | 'line' | 'html' | 'json' | 'junit';
    timeout?: number;
    use?: Partial<PlaywrightTestOptions>;
    webServer?: {
      command: string;
      url?: string;
      reuseExistingServer?: boolean;
      timeout?: number;
    };
  }

  export function defineConfig(config: PlaywrightTestConfig): PlaywrightTestConfig;
}

declare module '@testing' {
  export * from '@playwright/test';
}
