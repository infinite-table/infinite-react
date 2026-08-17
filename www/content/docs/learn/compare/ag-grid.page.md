---
title: Infinite Table vs AG Grid
description: A detailed comparison of Infinite Table and AG Grid for React. React-native API vs framework-agnostic wrapper, features, and when AG Grid is the better choice.
---

[AG Grid](https://www.ag-grid.com/) is the most established commercial data grid on the market, used across React, Angular, Vue, and plain JavaScript. It has a massive feature surface and a large community. We respect what the AG Grid team has built — it's a feat of engineering.

The core difference is not price. It's how each grid relates to React.

AG Grid was designed as a framework-agnostic rendering engine. Its React package is a wrapper — an adapter layer that translates between AG Grid's internal model and React components. The grid's state, lifecycle, and rendering happen outside React's reconciler. You configure it through a `gridOptions` object and interact with it through imperative API calls like `api.setColumnDefs()`, `api.refreshCells()`, and `api.getSelectedRows()`.

Infinite Table was built for React from the start. There is no wrapper layer. Columns, sorting, grouping, and filtering are React props — controlled or uncontrolled, like any React component. Cell renderers are plain JSX. The grid participates in React's component tree, re-rendering when props change.

## What this means in practice

With AG Grid, you might write:

```tsx
// AG Grid: imperative API to update columns
const onButtonClick = () => {
  gridRef.current.api.setColumnDefs(newColumnDefs);
  gridRef.current.api.refreshCells({ force: true });
};
```

With Infinite Table, the same operation is a prop change:

```tsx
// Infinite Table: declarative React props
const [columns, setColumns] = useState(initialColumns);

const onButtonClick = () => {
  setColumns(newColumns); // grid re-renders automatically
};

<DataSource<T> primaryKey="id" data={dataSource}>
  <InfiniteTable<T> columns={columns} />
</DataSource>
```

No ref, no imperative API — just React state. The same pattern you use for `<input value={...} onChange={...} />` works for the entire grid.

## A small, composable API vs a large configuration surface

AG Grid has been shipping features for over a decade across four frameworks. The result is an enormous API surface — the [`GridOptions` interface](https://www.ag-grid.com/react-data-grid/grid-options/) spans hundreds of props across 25+ categories. That surface carries the weight of its history: overlapping options, boolean flags that only apply when another flag is set, and legacy alternatives that coexist with their replacements.

A few real patterns from the AG Grid docs:

- **Overlays** have three generations of API living side by side. The current `overlayComponent` / `overlayComponentSelector` approach coexists with the older `loadingOverlayComponent`, `noRowsOverlayComponent`, `overlayLoadingTemplate`, and `overlayNoRowsTemplate` — all still accepted. The docs annotate the older props with "Prefer `overlayComponent`/`overlayComponentSelector`", but both paths work. Similarly, `suppressNoRowsOverlay` is a standalone boolean while `suppressOverlays` takes an array of overlay names — two ways to suppress the same thing.
- **Row grouping** alone accounts for roughly 20 grid-level props: `groupDisplayType`, `autoGroupColumnDef`, `groupRowRenderer`, `showOpenedGroup`, `groupHideOpenParents`, `groupHideColumnsUntilExpanded`, `groupHideParentOfSingleChild`, `groupAllowUnbalanced`, `groupMaintainOrder`, `groupDefaultExpanded`, `isGroupOpenByDefault`, `groupLockGroupColumns`, `suppressGroupRowsSticky`, `rowGroupPanelShow`, `suppressDragLeaveHidesColumns`, `suppressGroupChangesColumnVisibility`, `functionsReadOnly`, and more — each a separate configuration knob.
- **Column menus** offer `columnMenu` (with values `'legacy'` and `'new'`), `getMainMenuItems`, and `getColumnMenuItems` — where the docs note that `getColumnMenuItems` "takes precedence over `getMainMenuItems` for the column menu." The prop `suppressMenuHide` is only recommended when `columnMenu = 'legacy'`.

None of this is a criticism of AG Grid's engineering — supporting four frameworks and a decade of backwards compatibility requires exactly this kind of surface. But it's a trade-off. Every `suppress*` boolean, every pair of overlapping callbacks, every legacy-vs-new toggle is something your team has to understand, or at least know not to touch.

Infinite Table makes the opposite bet: keep the API surface small and composable.

- Instead of a forest of boolean flags, Infinite Table uses **function props as building blocks**. The [`groupColumn`](/docs/learn/grouping-and-pivoting/grouping-rows) prop can be a column object (single group column) or a function (called for each generated column). One prop, two behaviours — no `groupDisplayType` + `autoGroupColumnDef` + `groupRowRenderer` to coordinate.
- Instead of `suppress*` booleans, features are **controlled or uncontrolled**. Want to manage sorting yourself? Pass `sortInfo` (controlled). Want the grid to handle it? Pass `defaultSortInfo` (uncontrolled). The same pattern as `value` vs `defaultValue` on a React `<input>`.
- Instead of `getMainMenuItems` + `getColumnMenuItems` with precedence rules, Infinite Table has a single [`getContextMenuItems`](/docs/learn/context-menus/using-context-menus) callback.

The result is a smaller surface you can hold in your head. Fewer props, fewer interactions between props, fewer "this only works when that other prop is set" footnotes.

## Architecture

| | Infinite Table | AG Grid |
|---|---|---|
| **Built for** | React | Framework-agnostic (JS, Angular, Vue, React) |
| **React integration** | Native — renders through React's reconciler | Wrapper — React adapter around internal DOM engine |
| **API style** | Declarative props, controlled + uncontrolled | Grid-options object, imperative `api.*` calls |
| **Cell renderers** | Plain JSX components | AG Grid component interface (React components supported via adapter) |
| **State management** | Lives in React (useState, context, external stores) | Lives inside the grid; synced to React via callbacks |
| **TypeScript** | Written in TypeScript, first-class types | Written in TypeScript, first-class types |
| **Virtualization** | Row + column | Row + column |

## Feature Comparison

| Feature | Infinite Table (free) | AG Grid Community (free) | AG Grid Enterprise (paid) |
|---|---|---|---|
| Sorting (single + multi) | ✅ | ✅ | ✅ |
| Column filtering | ✅ | ✅ | ✅ |
| Column resizing | ✅ | ✅ | ✅ |
| Column reordering | ✅ | ✅ | ✅ |
| Column pinning | ✅ | ✅ | ✅ |
| Column grouping (headers) | ✅ | ✅ | ✅ |
| Row grouping | ✅ | 🔴 | ✅ |
| Aggregations | ✅ | 🔴 | ✅ |
| Pivoting | ✅ | 🔴 | ✅ |
| Tree data | ✅ | 🔴 | ✅ |
| Master-detail | ✅ | 🔴 | ✅ |
| Lazy loading | ✅ | 🔴 | ✅ (server-side row model) |
| Live pagination | ✅ | 🔴 | ✅ |
| Row + column virtualization | ✅ | ✅ | ✅ |
| Cell editing | ✅ | ✅ | ✅ |
| Cell selection | ✅ | 🔴 | ✅ (range selection) |
| Row selection | ✅ | ✅ | ✅ |
| Context menus | ✅ | 🔴 | ✅ |
| Keyboard navigation | ✅ | ✅ | ✅ |
| Theming (CSS variables) | ✅ | ✅ | ✅ |
| Excel export | 🔴 | 🔴 | ✅ |
| Clipboard | 🔴 | 🔴 | ✅ |
| Integrated charting | 🔴 | 🔴 | ✅ |
| Server-side row model | ✅ | 🔴 | ✅ |
| Status bar / sidebar panels | 🔴 | 🔴 | ✅ |

<Note>

AG Grid Community (MIT) does not include row grouping, pivoting, aggregations, tree data, or master-detail. Those require AG Grid Enterprise. Infinite Table includes all of these in the free Community build (with a "Powered by Infinite Table" footer). A paid license key removes the footer.

</Note>

## Pricing

| | Infinite Table | AG Grid Enterprise |
|---|---|---|
| **Starting price** | [$395/dev/year](https://infinite-table.com/pricing) | [~$999/dev/year](https://www.ag-grid.com/license-pricing) |
| **Volume discount** | 5% at 3 devs, 10% at 5, 15% at 10 | Contact sales |
| **Deployment license** | None required | None required |
| **Free tier** | All features, footer displayed | Community edition (grouping/pivot excluded) |
| **Support** | Email (paid license) | Zendesk (Enterprise license) |

## When AG Grid is the better choice

- **Multi-framework projects.** If you need the same data grid across Angular, Vue, and React codebases, AG Grid is the only option here — Infinite Table is React-only. AG Grid's framework-agnostic core is a strength when your organisation standardises on one grid across teams.
- **The widest feature surface.** AG Grid Enterprise includes built-in charting, clipboard, Excel export, column tool panels, status bars, and a full server-side row model with partial store. If you need several of these, AG Grid covers them in one package.
- **Enormous community and ecosystem.** With over 1M weekly npm downloads and 13k+ GitHub stars, AG Grid has deep community resources, Stack Overflow coverage, and third-party integrations. If you value ecosystem maturity, AG Grid is unmatched.
- **You prefer the imperative API.** If your team already knows AG Grid's `api.*` pattern from other projects, or you prefer imperative control over the grid's state, AG Grid's model may feel more natural to you than a prop-driven React API.

## When Infinite Table is the better fit

- **You want the grid to feel like React.** Infinite Table's API is props, controlled state, and JSX — the same patterns you use in every other React component. No grid-options objects, no imperative API calls, no syncing grid state back to React. If your team thinks in React, Infinite Table fits that mental model.
- **You want a small, composable API you can reason about.** Infinite Table ships grouping, pivoting, and aggregations with a fraction of the configuration surface. Function props instead of boolean flag forests, controlled/uncontrolled patterns instead of `suppress*` toggles, one callback where AG Grid has two with precedence rules. Fewer props, fewer interactions between props, fewer surprises.
- **You need grouping, pivoting, and aggregations without an enterprise license.** These are included in Infinite Table's free build. AG Grid gates them behind the Enterprise tier.
- **Simpler licensing.** One plan, one key for the whole team, no deployment license.


<HeroCards>
<YouWillLearnCard title="Getting Started" path="/docs/learn/getting-started">
Install the package, render your first DataGrid, and learn how `<DataSource />` and `<InfiniteTable />` work together.
</YouWillLearnCard>
<YouWillLearnCard title="Grouping and pivoting" path="/docs/learn/grouping-and-pivoting">
The features AG Grid Community leaves out — included here without an Enterprise license.
</YouWillLearnCard>
</HeroCards>

<HeroCards>
<YouWillLearnCard title="Pricing" path="/pricing">
Use Infinite Table free with a footer, or buy a license to remove it and get email support.
</YouWillLearnCard>
<YouWillLearnCard title="AG Grid docs" path="https://www.ag-grid.com/react-data-grid/getting-started/" newTab>
Read AG Grid's official React getting started guide.
</YouWillLearnCard>
</HeroCards>

## Help us keep this comparison up-to-date

This page is our reading of AG Grid's public docs and pricing as of mid-2026. We want it to stay accurate. If you work on AG Grid — or you've spotted something that's wrong, outdated, or missing context — please tell us. We will update the page.

- [Edit this page on GitHub](https://github.com/infinite-table/infinite-react/edit/master/www/content/docs/learn/compare/ag-grid.page.md) and open a pull request
- [File a correction issue](https://github.com/infinite-table/infinite-react/issues/new?template=compare_page_correction.md&title=Compare%20page%20correction%3A%20AG%20Grid)
- Email [admin@infinite-table.com](mailto:admin@infinite-table.com?subject=Compare%20page%20correction%3A%20AG%20Grid) with the URL and what should change
