---
title: Infinite Table Documentation
description: Developer Documentation for Infinite Table, your go-to React DataGrid component to handle huge amounts of data
---

<HomepageHero />

## What is Infinite Table?

Infinite Table is a React DataGrid component for displaying virtualized tabular data.

It helps you display huge datasets and get the most out of your data by providing you the right tools to enjoy these features:

- [<img src="/icons/50x50/sorting.svg" height="50" width="50" style={{display: 'inline-block'}} /> sorting](/docs/learn/sorting/overview)
- [<img src="/icons/50x50/row-grouping.svg" height="50" width="50" style={{display: 'inline-block'}} /> row grouping](/docs/learn/grouping-and-pivoting/grouping-rows) - both server-side and client-side
- [<img src="/icons/50x50/pivoting.svg" height="50" width="50" style={{display: 'inline-block'}} /> pivoting](/docs/learn/grouping-and-pivoting/pivoting/overview) - both server-side and client-side
- [<img src="/icons/50x50/aggregations.svg" height="50" width="50" style={{display: 'inline-block'}} /> aggregations](/docs/learn/grouping-and-pivoting/grouping-rows#aggregations)
- [<img src="/icons/50x50/live-pagination.svg" height="50" width="50" style={{display: 'inline-block'}} /> live pagination](/docs/learn/working-with-data/live-pagination)
- [<img src="/icons/50x50/lazy-loading.svg" height="50" width="50" style={{display: 'inline-block'}} /> lazy loading](/docs/learn/working-with-data/lazy-loading)
- [<img src="/icons/50x50/keyboard-navigation.svg" height="50" width="50" style={{display: 'inline-block'}} /> keyboard navigation](/docs/learn/keyboard-navigation/navigating-cells)
- [<img src="/icons/50x50/fixed-flex-cols.svg" height="50" width="50" style={{display: 'inline-block'}} /> fixed and flexible columns](/docs/learn/columns/fixed-and-flexible-size)
- [<img src="/icons/50x50/column-grouping.svg" height="50" width="50" style={{display: 'inline-block'}} /> column grouping](/docs/learn/column-groups)
- [<img src="/icons/50x50/filtering.svg" height="50" width="50" style={{display: 'inline-block'}} /> filtering](/docs/learn/filtering)
- [<img src="/icons/50x50/theming.svg" height="50" width="50" style={{display: 'inline-block'}} /> theming](/docs/learn/theming)

## Installation

Installation could not be more straightforward - just one npm command:

<TerminalBlock>
npm i @infinite-table/infinite-react
</TerminalBlock>

## ❤️ TypeScript

Infinite Table is fully typed and offers you a great developer experience, to help you get up and running quickly.

> The TypeScript typings file is included in the npm package - you don't have to download an additional **@types** package


<HeroCards>
<YouWillLearnCard title="Learn about our TypeScript typings" path="/docs/learn/getting-started/typescript-types">
Read more about how to use our TypeScript types
</YouWillLearnCard>

</HeroCards>

## 📄 Extensive Documentation

We're aware good documentation is a must and are updating our documentation as we add new features. Head to [our getting started](/docs/learn/getting-started) guide to get up and running quickly.

## 🏢 Enterprise-Ready

Infinite Table is ready to power your enterprise apps, as it supports advanced [data fetching](/docs/learn/working-with-data#data-loading-strategies), [filtering](/docs/learn/filtering), [sorting](/docs/learn/sorting/overview), [grouping](/docs/learn/grouping-and-pivoting/grouping-rows), [pivoting](/docs/learn/grouping-and-pivoting/pivoting/overview), [aggregations](/docs/learn/grouping-and-pivoting/group-aggregations), [live pagination](/docs/learn/working-with-data/live-pagination), [lazy loading](/docs/learn/working-with-data/lazy-loading) - all of those with support for both client-side and server-side implementations.

You can choose to leverage our built-in implementations in the browser, or you can process your data on the server with full support from our-side.

### 🔒 Secure by Default

We take security seriously and only have a total of 3 dependencies in our full dependency graph - and this number will only go down.

### 📦 Small Bundle Size

Our bundle size is under `250kB` and we're dedicated to [keeping it small](https://bundlephobia.com/package/@infinite-table/infinite-react).

<HeroCards>
<YouWillLearnCard title="Small bundle" newTab path="https://bundlephobia.com/package/@infinite-table/infinite-react">

See our bundle size in BundlePhobia

</YouWillLearnCard>
</HeroCards>

### 🧪 Automated End-to-End Tests

Our releases are automated and, we have full end-to-end tests that ensure we're delivering to our standards.

Real-browser tests help us move with confidence and continue to ship great features.

<HeroCards>
<YouWillLearnCard title="End-to-end tests" newTab path="https://github.com/infinite-table/infinite-react/tree/master/examples/src/pages/tests">

Check out our end-to-end tests in GitHub

</YouWillLearnCard>

</HeroCards>

## 🎨 Themable

`Infinite Table` is fully customizable, via CSS variables.

It ships with both a **light** and a **dark** theme - all you have to do is import the CSS file from the package.

```ts
import '@infinite-table/infinite-react/index.css';

// This file includes both the light and the dark themes.
```

<HeroCards>
<YouWillLearnCard title="Theming with CSS Variables" path="/docs/learn/theming#css-variables">

Read how to use themes and **CSS variables** to customize every aspect of Infinite Table

</YouWillLearnCard>
</HeroCards>
