---
id: home
layout: Home
permalink: index.html
---

<HomepageHero />

## What is Infinite?

Infinite Table is a React DataGrid component for displaying virtualized tabular data. It helps you display huge datasets and get the most out of them by providing you the right tools to do so: 

* [sorting](/docs/latest/learn/working-with-data/sorting)
* [row grouping](/docs/latest/learn/grouping-and-pivoting/grouping-rows) - both server-side and client-side
* [pivoting](/docs/latest/learn/grouping-and-pivoting/pivoting) - both server-side and client-side
* [aggregations](/docs/latest/learn/grouping-and-pivoting/grouping-rows#aggregations)
* [live pagination](/docs/latest/learn/working-with-data/live-pagination)
* [lazy loading](/docs/latest/learn/working-with-data/lazy-loading)
* [keyboard navigation](/docs/latest/learn/keyboard-navigation/navigating-cells)
* [fixed and flexible columns](/docs/latest/learn/columns/fixed-and-flexible-size)
* [column grouping](/docs/latest/learn/column-groups)
* [theming](/docs/latest/learn/theming)


## Installation

<TerminalBlock>
npm i @infinite-table/infinite-react
</TerminalBlock>

## ❤️ TypeScript

It's fully typed and offers you great developer experience to help you get up and running quickly

> The TypeScript typings file is included in the npm package - you don't have to download an additional **@types** package.

## 📄 Extensive documentation

We're aware good documentation is a must and are updating our documentation as we add new features. Head to [our getting started](/docs/latest/learn/getting-started) guide to get up and running quickly.

## 🏢 Enterprise-ready

Infinite Table is ready to power your enterprise apps, as it supports advanced data fetching, filtering, sorting, grouping, pivoting, aggregations, live pagination, lazy loading - all of those with support for both client-side and server-side implementations.

You can choose to leverage our built-in implementations in the browser or you can process your data on the server with full support from our-side.

### 🔒 Secure by default

We take security seriously and only have a total of 3 dependencies in our full dependency graph - and this number will only go down.

### 📦 Small bundle size

Our bundle size is under `200kB` and we're keeping it small.

### 🧪 Automated end-to-end tests

Our releases are automated and we have end-to-end tests that ensure we're delivering to our standards. Real-browser tests help us move with confidence and continue to ship great features.


<HeroCards>
<YouWillLearnCard title="End-to-end tests" newTab path="https://github.com/infinite-table/infinite-react/tree/master/source/examples/src/pages/tests">

Check out our end-to-end tests in Github

</YouWillLearnCard>

<YouWillLearnCard title="Small bundle" newTab path="https://bundlephobia.com/package/@infinite-table/infinite-react">

See our bundle size in BundlePhobia

</YouWillLearnCard>
</HeroCards>


## 🎨 Themable

`Infinite Table` is fully customizable, via CSS variables. It ships with both a **light** and a **dark** theme - you have to import the CSS file from the package.

```ts
import "@infinite-table/infinite-react/index.css"

// This file includes both the light and the dark themes.
```


<HeroCards>
<YouWillLearnCard title="Theming with CSS variables" path="/docs/latest/learn/theming#css-variables">

Read how to use themes and **CSS variables** to customize every aspect of Infinite Table.

</YouWillLearnCard>
</HeroCards>