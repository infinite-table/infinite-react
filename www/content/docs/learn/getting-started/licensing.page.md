---
title: Licensing Infinite Table
description: Free Usage and Licensing with Infinite Table
vue: true
angular: true
---

## Free Usage

<FrameworkContent framework="react">

You can immediately download and use [Infinite Table from the NPM registry](https://www.npmjs.com/package/@infinite-table/infinite-react) free of charge.

</FrameworkContent>

<FrameworkContent framework="vue">

You can immediately download and use [Infinite Table for Vue from the NPM registry](https://www.npmjs.com/package/@infinite-table/infinite-vue) free of charge. `@infinite-table/infinite-vue` is published under the same license as the React and Angular packages - one license covers all three.

</FrameworkContent>

<FrameworkContent framework="angular">

You can immediately download and use [Infinite Table for Angular from the NPM registry](https://www.npmjs.com/package/@infinite-table/infinite-angular) free of charge. `@infinite-table/infinite-angular` is published under the same license as the React and Vue packages - one license covers all three.

</FrameworkContent>

<Note>

When using Infinite Table for free, you have access to **all the features** of Infinite Table, but you will see a [Powered by Infinite Table](https://infinite-table.com) link in the table footer.

</Note>

You can use it for free in any product, but make sure the footer is always visible when Infinite Table is visible. Check the demos below to see the license footer in action: the first one has no license key (`licenseKey=""`), so it shows the "Powered by Infinite Table" footer. The second one uses an invalid license key, so the footer is red and says the license is invalid (the details are logged to the console).

```tsx file="missing-license.demo.tsx" title="Missing License Demo"
```

```tsx file="invalid-license.demo.tsx" title="Invalid License Demo"
```

## Licensed Usage

We invite you to try out Infinite Table and explore all the features it has to offer. We're confident it will be a useful addition to your applications.

We encourage companies 🙌 to purchase development licenses for their teams and help us improve the product and support the development of new features.

<FrameworkContent framework="angular">

After purchasing, you receive a license key. Provide it once, for every grid of your application, with `provideInfiniteTable` in your application config:

```ts file="index.snippet.angular.ts" region="license-key"
```

A grid's own `[licenseKey]` input wins over it.

</FrameworkContent>

<HeroCards>
<YouWillLearnCard title="See Pricing" path="/pricing">
See our pricing page for more information on how to purchase a license.
</YouWillLearnCard>
<YouWillLearnCard title="Compare licensing" path="/compare">
See how Infinite Table's licensing and features compare with AG Grid, MUI X and other data grids.
</YouWillLearnCard>

</HeroCards>
