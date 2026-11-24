---
title: Bklit charts in your React DataGrid
description: Sparklines in the cells, sparklines for the group rows and a chart that follows the row selection - Infinite Table with Bklit UI, the open-source React charts you add with the shadcn CLI. Both read the same shadcn/ui colors.
date: 2026-11-24
author: radu
tags: charts, integration, shadcn, tailwind
---

[Bklit UI](https://bklit.com) is an open-source (MIT) chart library for React, built on d3 and Motion. It isn't an npm package: like shadcn/ui, it's a registry, and the shadcn CLI copies the source of a chart into your project. Once it's there, it's your code, and you can change anything in it.

A chart that's just a React component in your codebase can go anywhere you render React - including the cells of `<InfiniteTable />`.

The demo below is a "top pages" view of a website's analytics. Every page has a Bklit sparkline of its daily visitors, every section has one too, and the chart at the top draws the pages you select in the grid. Change the range, select a few more pages, hover the chart.

<DemoDescription>

Select pages with the checkboxes to add them to the chart (the first five get a line) and click a page in the legend to remove it. The sparkline of a page in the chart has the color of its line.

</DemoDescription>

```tsx file="bklit-demo/top-pages-tailwind.demo.tsx" title="Top pages: Infinite Table with Bklit charts" files=off height="large"
```

## Adding Bklit to your project

In a project set up with shadcn/ui (`npx shadcn@latest init`), the demo needs two Bklit charts, the line chart and the sparkline:

```bash
npx shadcn@latest add @bklit/line-chart @bklit/sparkline
npm i @infinite-table/infinite-react
```

The CLI copies the charts into `components/charts` and installs what they depend on: `d3-shape`, `d3-scale`, `d3-array`, `motion` and a few small packages. The demo has the same files in its folder, so it imports them from `./components/charts` instead of `@/components/charts`.

## A sparkline in every row

A column's <PropLink name="columns.renderValue" /> can return any React element. The trend column's value is an array of numbers - the visitors of each day in the selected range - and `renderValue` gives it to an `AreaSparkline`:

```tsx file="bklit-demo/top-pages-tailwind.demo.tsx" region="trend-column" live=false
```

Two of those props are there because of how Infinite Table renders cells:

- **`width`**. By default, a sparkline is as wide as its parent. In a cell, the parent is the cell's content, which is only as wide as what it holds - so there's nothing to fill. The column's `computedWidth` is the width we want, and it changes while you resize the column, so the sparkline follows.
- **`animate={false}`**. Infinite Table only renders the rows you can see. When you scroll, it keeps its cells and gives them the rows that come into view. A Bklit sparkline animates from its old data to its new data, so with animations on, the sparklines would morph from one row into another while you scroll.

## Sparklines for the groups, from an aggregation

The pages are grouped by section, and group rows use the same trend column. The value they get is the result of an [aggregation reducer](/docs/learn/grouping-and-pivoting/group-aggregations) for the `trend` field: the visitors of all the pages in the section, summed day by day.

```tsx file="bklit-demo/top-pages-tailwind.demo.tsx" region="aggregations" live=false
```

Infinite Table puts the result of a reducer in the data of the group row, under the reducer's `field`. So `renderValue` gets the summed array as its `value`, and the same code draws the sparkline of a page and the one of its section. The other reducers work the same way: visitors are summed, the change is computed from the section's totals, and the bounce rate and the time on page are averaged, weighted by visitors.

## The chart follows the selection

The grid has [multi-row selection](/docs/learn/selection/row-selection) with checkboxes, and the selection is controlled: the demo keeps it in its state, so the chart can use it too.

```tsx file="bklit-demo/top-pages-tailwind.demo.tsx" region="selection" live=false
```

The <DataSourcePropLink name="primaryKey" /> of the rows is the path of the page, so the selection is a list of paths, in the order you selected them. Selecting a section selects its pages, and the checkbox in the header selects them all (then the selection is "all, except the deselected ones" - the `defaultSelection: true` branch above).

The first five selected pages get a color, and the color goes in two places: the line in the chart, and the sparkline and the dot in the grid. A page keeps its color while it's in the chart, so removing one page doesn't repaint the others.

The chart is a Bklit `LineChart`. It takes one object per date, with a key for each line, so the demo builds that from the `trend` arrays of the selected pages:

```tsx file="bklit-demo/top-pages-tailwind.demo.tsx" region="chart" live=false
```

With nothing selected, the chart shows the total of all pages.

## One set of colors for both

Infinite Table has a [`shadcn` theme](/docs/learn/theming): import `@infinite-table/infinite-react/theme/shadcn.css` and put the `infinite-theme-name--shadcn` class name on a parent of the grid, and the grid takes its colors from the shadcn/ui CSS variables - `--background`, `--foreground`, `--border`, `--muted-foreground` and the others. Bklit charts read the same variables for their tooltip, and add a few of their own, like `--chart-grid` and `--chart-label`. So the colors of both are defined once:

```tsx file="bklit-demo/top-pages-tailwind.demo.tsx" region="theme" live=false
```

In your app, this CSS is in your global stylesheet (shadcn/ui and Bklit put their variables there when you add them), and the dark mode is the `dark` class name of shadcn/ui. The demo adds the colors of the selected pages (`--series-1` to `--series-5`), and uses `infinite-theme-mode--dark` for the dark mode, as the rest of these docs.

## Wrapping up

Bklit charts are React components in your codebase, and Infinite Table renders React components in its cells. So most of the integration is passing data around: an array of numbers for each sparkline, an aggregation reducer for the groups, the row selection for the chart.

The full code of the demo is in its code tab. To go further:

- the [Bklit docs](https://bklit.com/docs) for the other charts - bar, area, heatmap, pie and more;
- [column rendering](/docs/learn/columns/column-rendering) in Infinite Table;
- [aggregations](/docs/learn/grouping-and-pivoting/group-aggregations) and [row selection](/docs/learn/selection/row-selection).
