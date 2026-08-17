---
title: Infinite Table vs TanStack Table
description: A detailed comparison of Infinite Table and TanStack Table. Declarative rendered grid vs headless logic library — architecture, features, and when TanStack Table is the better choice.
---

[TanStack Table](https://tanstack.com/table) (formerly React Table) is a popular, MIT-licensed headless table library. It provides table logic — sorting, filtering, grouping, pagination — but no UI. You bring your own JSX, your own styles, your own virtualization, your own keyboard navigation.

Infinite Table is a fully rendered React data grid. You pass props — columns, data, grouping configuration — and get a complete, virtualized, keyboard-navigable grid with theming out of the box. Both are valid approaches. The question is where you want to spend your engineering time.

## Two ends of a spectrum

The "Why Another DataGrid?" question comes down to a positioning choice. At one end of the spectrum is AG Grid — a full-featured grid engine that wraps itself for React. At the other end is TanStack Table — headless hooks that give you total rendering control but require you to build everything visible.

Infinite Table sits in the middle: **a declarative React component that ships the grid**. You get the React-native API feel (props, controlled state, JSX cell renderers) without having to construct the table markup, virtualization, focus management, and accessibility yourself.

```tsx
// TanStack Table: you provide all the JSX
const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

return (
  <table>
    <thead>
      {table.getHeaderGroups().map(headerGroup => (
        <tr key={headerGroup.id}>
          {headerGroup.headers.map(header => (
            <th key={header.id}>
              {flexRender(header.column.columnDef.header, header.getContext())}
            </th>
          ))}
        </tr>
      ))}
    </thead>
    <tbody>
      {table.getRowModel().rows.map(row => (
        <tr key={row.id}>
          {row.getVisibleCells().map(cell => (
            <td key={cell.id}>
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
);
```

```tsx
// Infinite Table: declarative props, grid ships complete
<DataSource<T> primaryKey="id" data={dataSource}>
  <InfiniteTable<T> columns={columns} />
</DataSource>
```

Both examples display tabular data. The first gives you total control over every `<tr>` and `<td>`. The second gives you a working grid — virtualized, keyboard-navigable, themeable — in two components.

## Architecture

| | Infinite Table | TanStack Table |
|---|---|---|
| **Type** | Rendered React component | Headless logic library |
| **What you get** | Full UI: virtualized grid, headers, cells, scrollbars, keyboard nav, theming | Table state + utilities; you provide all DOM and styling |
| **API style** | Declarative props (controlled + uncontrolled) | Hooks that return row/cell models; you render everything |
| **Cell rendering** | JSX — pass a React component as a column prop | You call `flexRender()` yourself inside your own markup |
| **Frameworks** | React | React, Vue, Solid, Svelte, vanilla JS |
| **Virtualization** | Built-in row + column virtualization | Not included; pair with [TanStack Virtual](https://tanstack.com/virtual) or your own |
| **TypeScript** | First-class | First-class |
| **Bundle** | Single package, includes CSS | Tiny core; total size depends on what you build on top |

## Feature Comparison

| Feature | Infinite Table | TanStack Table |
|---|---|---|
| Sorting | Built-in UI + logic | Logic only |
| Column filtering | Built-in filter UI + logic | Logic only |
| Row grouping | Built-in, with expand/collapse UI | Logic only |
| Aggregations | Built-in | Logic only |
| Pivoting | Built-in | Logic only |
| Tree data | Built-in (TreeGrid) | Logic only (expanding rows) |
| Column resizing | Built-in | Logic helpers; you build the drag handles |
| Column reordering | Built-in | Not included |
| Column pinning | Built-in | Logic helpers; you implement sticky positioning |
| Cell editing | Built-in | Not included |
| Cell selection | Built-in | Not included |
| Row selection | Built-in UI (checkbox, click) | Logic only |
| Keyboard navigation | Built-in | Not included |
| Context menus | Built-in | Not included |
| Master-detail | Built-in | Not included |
| Lazy loading / live pagination | Built-in | Not included (pagination logic available) |
| Row + column virtualization | Built-in | Not included; use TanStack Virtual |
| Theming | CSS variables, multiple built-in themes | N/A — you style everything |

<Note>

"Logic only" means TanStack Table handles the state and computations, but you write all the JSX, CSS, event handlers, and accessibility attributes. This is powerful but requires substantial development effort for a production-grade data grid.

</Note>

## What "headless" means in practice

With TanStack Table, building a production data grid involves:

1. Rendering the `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<td>` (or `<div>`-based layout) yourself.
2. Wiring up virtualization (typically TanStack Virtual) for large datasets.
3. Building filter UIs, sort indicators, group expand/collapse toggles, resize handles, and column reorder drag-and-drop.
4. Handling keyboard navigation and ARIA attributes for accessibility.
5. Styling everything from scratch or integrating with your design system.

This is the right approach when you need pixel-perfect control or are building a design-system component library. But it means weeks of work to reach feature parity with a rendered grid — and that code becomes yours to maintain.

With Infinite Table, grouping, pivoting, filtering, virtualization, keyboard navigation, and theming work the moment you render the component. You customise through props and JSX cell renderers, not by rebuilding the grid's internals.

## Pricing

TanStack Table is MIT-licensed and free. There is no paid tier.

Infinite Table's Community build is also free — all features included — but displays a "Powered by Infinite Table" footer. A [paid license ($395/dev/year)](https://infinite-table.com/pricing) removes the footer and adds email support.

## When TanStack Table is the better choice

- **Total rendering control.** You need pixel-perfect custom UI, or you're building a table component for a design-system library where the rendered output must match your design spec exactly.
- **Multi-framework.** TanStack Table works across React, Vue, Solid, and Svelte. Infinite Table is React-only.
- **Minimal bundle.** If you only need sorting and basic filtering on a small dataset (no virtualization, no grouping), TanStack Table's core is smaller than any full grid component.
- **Zero restrictions.** MIT license with no footer, no license key, no terms beyond MIT.
- **Existing investment.** If your team has already built a mature grid UI on top of TanStack Table, migrating to a rendered grid may not justify the effort.

## When Infinite Table is the better fit

- **You want to ship the grid, not build it.** Infinite Table delivers a production-ready grid — virtualized, keyboard-navigable, themed — out of the box. You focus on your product, not on re-implementing table infrastructure.
- **You want React-native API feel without the assembly work.** TanStack Table gives you hooks and row models; you assemble the JSX. Infinite Table gives you declarative props and controlled state — the same patterns you use in every other React component — but ships the complete UI so you don't have to build it yourself.
- **Complex data features built in.** Master-detail, tree grids, lazy loading, live pagination, cell editing, cell selection, and context menus are all included. Building these on top of TanStack Table is a significant engineering project.
- **Accessibility and keyboard support.** Infinite Table includes keyboard navigation and focus management. With TanStack Table, you implement these yourself.

## Get started

<TerminalBlock>
npm i @infinite-table/infinite-react
</TerminalBlock>

- [Getting Started guide](/docs/learn/getting-started)
- [Grouping and Pivoting](/docs/learn/grouping-and-pivoting)
- [Pricing](/pricing)
- [TanStack Table official docs](https://tanstack.com/table/latest/docs/introduction)
