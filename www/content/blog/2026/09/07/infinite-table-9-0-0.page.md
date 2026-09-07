---
title: Infinite Table 9.0.0 — faster rendering, correct pivot sorting, and a renderer-agnostic core
description: Infinite Table 9.0.0 is out. Fewer re-renders on column and viewport updates, sorting by pivot columns that actually sorts, a theme builder in the DevTools extension — and the groundwork for a Vue version of the DataGrid.
date: 2026-09-07
author: radu
tags: release, performance, pivoting, vue
---

Infinite Table `9.0.0` is on out! It is a major version because of what changed under the hood, not because of what changed in your code — the public React API is unchanged and upgrading from `8.x` should be a version bump.

```sh
npm install @infinite-table/infinite-react@latest
```

Here is what is in it.

## Fewer re-renders

Most of the work in this release went into the rendering pipeline.

The grid now does less work per update. Resizing, reordering, pinning or hiding columns, moving the active cell, and scrolling through the viewport all re-render fewer cells than before — only the ones that actually changed. On wide grids with many visible columns this is noticeable as smoother scrolling and snappier column interactions.

None of this requires anything from you. If you already followed the advice in [our performance debugging post](/blog/2025/10/20/debugging-your-datagrid-performance-with-custom-tracks-in-chrome-devtools-performance-profiler), open the profiler on a grid with a wide column set and compare `8.0.5` to `9.0.0` — the render tracks are visibly shorter.

## Sorting by a pivot column

Pivoting generates columns from your data, and each generated column carries an aggregated value per group row. Clicking one of those headers to sort was, until now, unreliable: the sort info for a generated column did not map back onto the grouped rows the way a regular column's sort does.

In `9.0.0`, sorting by a pivot column sorts the group rows by the aggregated value in that column, at every grouping level, respecting <DPropLink name="sortTypes" /> and the column's `sortType`. Sorting the group column itself is also more robust — the sort is inferred from the current <DPropLink name="groupBy" />, so passing `{ id: 'group-by', dir: 1 }` is enough and the grid fills in the fields and types.

If you customize generated columns, last week's post on [customizing generated pivot columns](/blog/2026/09/03/customizing-generated-pivot-columns) covers the three override points; sorting now composes with all of them.

## Theme builder in DevTools

The [Infinite Table DevTools extension](https://chromewebstore.google.com/detail/infinite-table-devtools-e/jpipjljbfffijmgiecljadbogfegejfa) has a new Theme section. Point it at a running grid and you get every CSS variable the current theme defines, grouped and searchable, with live editing — change a color or a spacing value and the grid on the page updates immediately. When you are happy with the result, copy the variables out as CSS.

This is the fastest way we know of to answer "which variable controls this?" without reading through the theming reference.

## Still 100% React

This is the reason `9.0.0` is a major, so let's be clear about what it is not: it is not a rewrite, and it is not a framework-agnostic widget with a thin React wrapper.

From day one, Infinite Table has been designed to feel native to React. You compose `<DataSource />` and `<InfiniteTable />` like any other components, you pass props and render functions, you use hooks like `useInfiniteTableApi`, and the grid rides React's own scheduling — concurrent rendering, batched updates, async flushing — to stay fast. That has not changed. The React implementation in `9.0.0` is still React all the way down, and it still leans on React patterns for its performance.

What changed is that the engine underneath — virtualization, the data pipeline, grouping, pivoting, selection, editing — no longer needs to know which framework is rendering it. The principle stays the same: feel native to the target framework. We have extended that principle to a second target, and we have been replicating exactly that into Vue.

## About that Vue version

For a while now the repository has contained a second package: `@infinite-table/infinite-vue`. It is the same DataGrid — same `DataSource` and `InfiniteTable` components, same column definitions, same grouping, pivoting, tree, selection, and editing features — implemented for Vue 3.

```vue
<script setup lang="ts">
import '@infinite-table/infinite-vue/index.css';
import { DataSource, InfiniteTable } from '@infinite-table/infinite-vue';
</script>

<template>
  <DataSource :data="data" primaryKey="id">
    <InfiniteTable :columns="columns" />
  </DataSource>
</template>
```

Every functional test in our suite already runs against both the React and the Vue build, and the CI that gated this release ran them side by side. The `9.0.0` React release is what made that possible.

The Vue package is currently published under the `canary` tag while we finish the docs and settle the last bits of the API. We will have more to say about it soon — if you want an early look, install `@infinite-table/infinite-vue@canary` and tell us what breaks.

## Upgrading

```sh
npm install @infinite-table/infinite-react@9
```

No code changes are required. Minimum React version is still `18`. You can find other details are in the [releases page](/docs/releases).
