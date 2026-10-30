---
title: Releases
description: All releases | Infinite Table DataGrid for React
---

## 10.0.0

This release brings some changes and better clarity around sorting and filtering and where each of those operations happen. Everything is done in the browser unless you opt into reloading the data with <DPropLink name="shouldReloadData" />.

### Breaking changes

1. **Sorting and filtering happen in the browser by default.** A <DPropLink name="data" /> function no longer makes filtering remote, and a controlled <DPropLink name="sortInfo" /> no longer makes sorting remote. If your server sorts or filters - or you pass a controlled `sortInfo` / `filterValue` and sort or filter the data yourself - set <DPropLink name="shouldReloadData" />:

   ```tsx
   // before: implied by the data function / the controlled sortInfo
   <DataSource data={fetchRows} sortInfo={sortInfo} />

   // now
   <DataSource
     data={fetchRows}
     sortInfo={sortInfo}
     shouldReloadData={{ sortInfo: true, filterValue: true }}
   />
   ```

   With <DPropLink name="lazyLoad" />, sorting, filtering, grouping and pivoting still default to the server. With <DPropLink name="livePagination" />, sorting and filtering now default to the server (an uncontrolled sort change used to do nothing) and grouping stays in the browser - this also applies to array data with `livePagination`. In development, a warning is shown the first time the sorting or filtering changes for a `data` function without `shouldReloadData`. See [Sorting and filtering the data yourself](/docs/learn/working-with-data/sorting-and-filtering-the-data-yourself).

2. **A <DPropLink name="filterFunction" /> (or <DPropLink name="treeFilterFunction" />) decides the filtering on its own.** Before, the column filters (<DPropLink name="filterValue" />) were also applied after your function. Now your function gets the column filters in its param and does whatever filtering you want with them - to filter by them the same way as the built-in filtering, call the new `defaultFilterFunction`:

   ```tsx
   import { defaultFilterFunction } from '@infinite-table/infinite-react';

   // before
   filterFunction={({ data }) => data.age > 30}

   // now, to also apply the column filters
   filterFunction={(param) => defaultFilterFunction(param) && param.data.age > 30}
   ```

   In development, a warning is shown when a filter function is used with active column filters that it doesn't apply. The `filterDataArray` export follows the same rule, and no longer takes `operatorsByFilterType`.

3. **The deprecated `sortMode`, `filterMode` and `groupMode` props are removed.**

   - `sortMode="local"` / `filterMode="local"` - remove the prop; this is now the default.
   - `sortMode="remote"` - use `shouldReloadData={{ sortInfo: true }}`.
   - `filterMode="remote"` - use `shouldReloadData={{ filterValue: true }}`.
   - `groupMode` - use <DPropLink name="shouldReloadData.groupBy" />.

   Because of a bug, `sortMode="remote"` and `filterMode="remote"` (without `shouldReloadData`) used to sort and filter in the browser. With `shouldReloadData`, the sorting and filtering are now really left to the server.

4. **Column filters on tree data are applied to the leaf nodes.** Without a <DPropLink name="treeFilterFunction" />, the column filters used to be matched against the top-level nodes only. Now the leaf nodes are matched, and a parent node is kept when at least one of its descendants is kept - the fields of parent nodes are not matched. This is the new `defaultTreeFilterFunction`.

5. **A <DPropLink name="filterFunction" /> has no effect with <DPropLink name="lazyLoad" />.** The rows that are not loaded yet can't be filtered in the browser - with batching, using a `filterFunction` threw an error.

### Other changes

- `shouldReloadData.filterValue: true` together with a <DPropLink name="filterFunction" /> now reloads the data on every filter change and filters the returned rows in the browser - the reload was skipped before. Same as `shouldReloadData.sortInfo: true` with a <DPropLink name="sortFunction" />.
- New exports: `defaultFilterFunction` and `defaultTreeFilterFunction` (also from `@infinite-table/infinite-vue`, which now exports `multisort` and `multisortNested` too).
- The params of <DPropLink name="filterFunction" /> and <DPropLink name="treeFilterFunction" /> include `filterValue` and `filterTypes`; the params of `treeFilterFunction` include `isLeafNode`.
- When the <DPropLink name="data" /> function throws or returns a rejected promise, the grid no longer stays loading: the previous rows are kept and the error is logged. A failed batch with <DPropLink name="lazyLoad" /> is requested again when its rows are rendered again, and a failed group can be collapsed and expanded to request its children again.
- With local filtering, the `filterValue` in the <DPropLink name="data" /> params no longer includes the `valueGetter` functions.

## 9.4.2

Fix the `unfilteredCount` of the DataSource state with <DPropLink name="lazyLoad" />: it took the `totalCountUnfiltered` of any response, so loading the rows of a group replaced it with the count of that group. It's now the count that the top-level response sends without the filter - `totalChildrenCountUnfiltered` with grouping, `totalCountUnfiltered` without - or the row count, when the server doesn't send one.

## 9.4.1

With <DPropLink name="lazyLoad" /> and multi row selection, the group and header checkboxes now count the rows from the counts that the server sends, instead of estimating them:

- With the counts without the filter (`totalChildrenCountUnfiltered`, `totalCountUnfiltered`) and <DPropLink name="multiRowSelectionTarget" />`="all"`, a row or group that is selected or deselected on its own keeps its own selection, even when the filter hides it - deselecting a hidden row of a selected group leaves the group (and the header) partly selected.
- Otherwise, once all the rows of a group are loaded, a selected row that the filter hides is no longer counted, so it can't make a checkbox look checked.
- The top-level group response can include `totalChildrenCount`, the number of all leaf rows after the filter, which the header checkbox uses.

Fix the `filteredCount` of the DataSource state with <DPropLink name="lazyLoad" /> and grouping: it was the number of top-level groups. It's now the number of leaf rows - the `totalChildrenCount` of the top-level group response or, when it's missing, the sum of the `totalChildrenCount` of the top-level groups, once they are all loaded.

## 9.4.0

Fix changing <DPropLink name="groupBy" /> or <DPropLink name="pivotBy" /> at runtime with <DPropLink name="lazyLoad" />: the <DPropLink name="data" /> function was not called again, so the grid showed a single empty group row. With <DPropLink name="lazyLoad" />, <DPropLink name="shouldReloadData.groupBy" /> and <DPropLink name="shouldReloadData.pivotBy" /> now default to `true`.

## 9.3.0

With <DPropLink name="lazyLoad" /> and <DPropLink name="multiRowSelectionTarget" />`="all"`, the selection checkboxes can count the rows that the filter hides. The <DPropLink name="data" /> function can return `totalChildrenCountUnfiltered` on group items and on the top-level group response, and `totalCountUnfiltered` for rows - a selected group with hidden rows that are not selected then shows as partly selected. See [multi selection with lazy load](/docs/learn/selection/row-selection#multi-selection-with-lazy-load-and-grouping).

Fix the header selection checkbox with <DPropLink name="lazyLoad" />, a filter and <DPropLink name="multiRowSelectionTarget" />`="visible"`: it compared the selected rows with the count of rows without the filter, so selecting every row that passes the filter left it partly selected.

## 9.2.0

New <DPropLink name="multiRowSelectionTarget" /> DataSource prop. When some rows are filtered out, it decides which rows the header selection checkbox, the group row (or parent node) checkboxes and the select all/deselect all API methods act on: all the rows (`'all'`, the default) or only the rows that pass the filter (`'visible'`). With <DPropLink name="lazyLoad" />, the <DPropLink name="data" /> function receives `multiRowSelectionTarget` in its params, so the server can apply it.

Behaviour changes with client-side filtering and multi row selection:

- Fix the header selection checkbox on flat, filtered data. It used to compare the selected rows (including filtered out ones) with the count of visible rows, so it could show as checked or indeterminate in the wrong cases.
- With the default `'all'` target, group row and tree parent node checkboxes now count the rows that are filtered out. Selecting a filtered group already selected its hidden rows - the checkbox state now reflects that. To act only on the visible rows, use `multiRowSelectionTarget="visible"`. This also applies to the selection callback from `withSelectedLeafNodesOnly`.

Fix multi row selection with <DPropLink name="useGroupKeysForMultiRowSelection" /> and <DPropLink name="lazyLoad" />: selecting a group no longer deselects rows in sibling groups whose data is not loaded yet. With <DPropLink name="useGroupKeysForMultiRowSelection" />, the <DPropLink name="rowSelection" /> value now always lists leaf rows by their full path (group keys followed by the primary key).

## 9.1.5

The `Columns` and `Group by` submenus of the default column menu now use the custom <PropLink name="components.CheckBox" /> component, when one is specified.

## 9.1.3 

Fix DataSource: no duplicate first-batch load on sort in lazy mode, no refetch on inline filterTypes identity changes

## 9.1.2

Fix resizing a flex column when the fixed columns already overflow the viewport. The resized column now gets a fixed <PropLink name="columnSizing.width">width</PropLink> instead of a flex value in that case.

<PropLink name="columnSizing" /> now takes precedence over <PropLink name="columns.defaultFlex" /> — a `width` in `columnSizing` makes a `defaultFlex` column fixed.

## 9.1.1

Fix a crash in the edit lifecycle callbacks (<PropLink name="onEditPersistSuccess" />, `onEditPersistError`, <PropLink name="onEditAccepted" />, <PropLink name="onEditRejected" />, `onEditCancelled`) when the edit itself moves or removes the row — for example editing the value the grid is grouped by, so the row leaves a single-row group and the row count shrinks.
## 9.1.0 — 18.09.2026

New <PropLink name="repaintCellsKey" /> prop, also available per column as <PropLink name="columns.repaintCellsKey" />.

## 9.0.3

Pivot group columns bound to a `field` that is not a grouping key (including the pivot dimension) now show that value on nested group rows when every item in the group shares it.

## 9.0.2

Fix group columns bound to a `field` in pivoted grids.

## 9.0.1 — 08.09.2026

Generated pivot columns inherit sortability from the user column they inherit from — including <PropLink name="columns.defaultSortable" /> and <PropLink name="columnDefaultSortable" />. They are no longer unsortable.

## 9.0.0 — 07.09.2026

Read the [9.0.0 release blog post](/blog/2026/09/07/infinite-table-9-0-0).

Faster rendering: cell styling and CSS variable computation are now memoized and cell pooling skips redundant work, so column and viewport updates re-render less.

Sorting by a pivot column now works correctly — group rows are sorted by the aggregated value in the clicked pivot column, and group column sorting is inferred from `groupBy`.

Devtools: new theme builder in the [Infinite Table DevTools extension](https://chromewebstore.google.com/detail/infinite-table-devtools-e/jpipjljbfffijmgiecljadbogfegejfa), for live-editing CSS variables of the current theme.

Internal: the core has been made renderer-agnostic, paving the way for the upcoming Vue version of Infinite Table (published as a canary under `@infinite-table/infinite-vue`).

## 8.0.5 — 06.07.2026 

Fix [column drag issue](https://github.com/infinite-table/infinite-react/issues/288) 

## 8.0.4 — 08.04.2026 

Add `useDataSourceApi`, `useInfiniteTableApi` and `useInfiniteColumnApi` hooks

## 8.0.3 — 03.04.2026 

Improvements to the drag and drop implementation.

## 8.0.0

Perf improvements by refactoring the usage of React context.

Dramatically improve scrolling performance in horizontal layout scenarios, by avoiding React `flushSync` operations.

## 7.5.1

Minor fixes

## 7.5.0

Improve perf for data updates by 35% in certain scenarios.
Previously, updating a row would re-render the whole visible viewport.
Starting with this version, only the updated row will re-render.

Improve scrolling performance generally, by a lot, by doing async updates.
For scrolling in a horizontal layout configuration, the scrolling flushes cells synchronously.


## 7.4.2

Improve perf by leveraging React async flushing whenever possible.

## 7.4.1

Minor enhancement on the `debug` export
## 7.4.0

Add custom tracks in Chrome DevTools performance profiler. Read [our blogpost on custom tracks in Chrome DevTools performance profiler](/blog/2025/10/20/debugging-your-datagrid-performance-with-custom-tracks-in-chrome-devtools-performance-profiler)

## 7.3.6

Add `InfiniteTable.Body.rowHoverClassName` to allow customizing the CSS `className` applied to cells on hover.

## 7.3.3

Add CSS layer `infinite-table` to all CSS styles we provide in our CSS files.

## 7.3.2

Add support for `className` in `colTypes`.

## 7.3.1

Improve TreeSelectionState standalone usage by adding config for strict mode.

## 7.3.0

Fix DataGrid virtualization issues in React 18 and above, caused by batched updates
Improve tree selection when there is an external filter

Starting with this version, the minimum React version is `18`.

## 7.2.4 

Minor bugfixes

## 7.2.3

Fix listening to logs from the `debug` fn that Infinite exports, so we only listen to own logs. This avoids errors circular stringification errors of log messages.

## 7.2.2

Improve `TreeApi` with `getSelectedLeafNodePaths` method and other related methods.

## 7.2.1

Fix usage of React context, to be backwards compatible to React 18. This prevented the component from rendering in React 18 (affected version was 7.2.0).

## 7.2.0

Release GroupingToolbar - a new way to interact with your grouping.
Fix error that appeared when column pinning was used and no visible columns were available.

## 7.1.0

Support for React 19 - update source-code, fix tests and update typings to work with React 19

## 7.0.1

Bugfix related to devtools Uncaught TypeError: Cannot read properties of undefined (reading 'startsWith')

## 7.0.0

First version that supports Infinite Table devtools.

## 6.2.11

Improve performance on heavy scrolling by avoiding CSS vars for scroll pos.

## 6.2.10

Recompute DataSource repeat wrapped group rows when `wrapRowsHorizontally` changes.

## 6.2.9

Fix edge case where `repeatWrappedGroupRows` didn't work in trees for collapsed non-leaf nodes. When a non-leaf node was collapsed, if it was the first node in a column set, it didn't repeat its parents correctly.
Version `6.2.9` fixes this.

## 6.2.8

Minor bugfix.

## 6.2.6

Consolidate themes

## 6.2.2

Update shadcn theme to work well with the latest tailwind 4 colors.

## 6.2.0

Starting with this release, the CSS for each theme (other than the `"default"`) is not included in the root CSS file (`@infinite-table/infinite-react/index.css`) and has to be imported explicitly:

```ts
import '@infinite-table/infinite-react/theme/shadcn.css'
import '@infinite-table/infinite-react/theme/balsam.css'
import '@infinite-table/infinite-react/theme/minimalist.css'
import '@infinite-table/infinite-react/theme/ocean.css'
```

## 6.1.1

Fix performance regressions introduced in 6.1.0.

Add [Keyboard Navigation API](/docs/reference/keyboard-navigation-api)

## 6.1.0

This release includes a refactor of the core virtualization algorithm, which should result some performance improvements in certain scenarios.

@milestone id="142"

## 6.1.0-canary.0

Fix virtualization issues.

## 6.0.20


## 6.0.19

@milestone id="141"

## 6.0.18

@milestone id="140"

## 6.0.16

@milestone id="139"

## 6.0.15

@milestone id="138"

## 6.0.13

@milestone id="136"

## 6.0.12

@milestone id="135"

## 6.0.10

@milestone id="134"

## 6.0.9

@milestone id="133"

## 6.0.8

@milestone id="132"

## 6.0.5

@milestone id="131"

## 6.0.0

@milestone id="130"

## 5.0.5

@milestone id="129"

## 5.0.4

@milestone id="128"

## 5.0.1

@milestone id="127"

## 5.0.0

Add support for horizontal layout.

## 4.4.1

## 4.4.0

@milestone id="125"

## 4.3.7

@milestone id="124"

## 4.3.2

@milestone id="123"

## 4.3.0

Fix major lazy loading bugs and issues.

## 4.2.0

Replace `sortMode` with [shouldReloadData.sortInfo](https://infinite-table.com/docs/reference/datasource-props#shouldReloadData.sortInfo)
Replace `groupMode` with [shouldReloadData.groupBy](https://infinite-table.com/docs/reference/datasource-props#shouldReloadData.groupBy)

@milestone id="122"

## 4.1.0

@milestone id="121"

## 4.0.0

@milestone id="120"

## 3.3.4

@milestone id="119"

## 3.3.3

@milestone id="118"

## 3.3.0

@milestone id="117"

## 3.2.11

@milestone id="116"

## 3.2.6

@milestone id="115"

## 3.2.5

@milestone id="114"

## 3.2.3

@milestone id="112"

## 3.2.0

@milestone id="111"

## 3.1.5

@milestone id="109"

## 3.1.1

@milestone id="107"

## 3.1.0

@milestone id="106"

## 3.0.15

@milestone id="105"

## 3.0.12

@milestone id="104"

## 3.0.10

@milestone id="102"

## 3.0.9

@milestone id="101"

## 3.0.7

@milestone id="100"

## 3.0.4

@milestone id="99"

## 3.0.3

@milestone id="98"

## 3.0.1

@milestone id="97"

## 3.0.0

@milestone id="96"

## 2.0.8

@milestone id="95"

## 2.0.4 🚀

@milestone id="93"

## 2.0.3 🚀

@milestone id="92"

## 2.0.2 🚀

@milestone id="91"

## 2.0.0 🚀

This release, although a major one, does not introduce new major functionality, but rather improves on existing features and more specifically adds support for sorting group columns.

#### Improved group column sorting

Version `2.0.0` allows you to make group columns sortable, even when they are configured with `groupBy` fields that are not actually bound to columns.

```tsx
<DataSource<Person>
  groupBy={[
    // those fields are not bound to actual columns
    {field: 'team'},
    {field: 'age' },
  ]}>
  <InfiniteTable<Person>
    groupColumn={{
      sortType: ['string', 'number'], // <--- allows you to have
      // the group column sortable
    }}
    ...
/>
```

### Updated column sortable behavior

We've also introduced a few new props and renamed `column.sortable` to <PropLink name="columns.defaultSortable" />.

Also, the behavior for the <PropLink name="sortable" /> prop has changed. The new <PropLink name="columnDefaultSortable" /> is now what <PropLink name="sortable" /> used to be, while the <PropLink name="sortable" /> prop overrides any sorting flags and is the ultimate source of truth for column sorting.

@milestone id="90"

## 1.3.23 🚀

@milestone id="89"

## 1.3.22 🚀

@milestone id="88"

## 1.3.21 🚀

@milestone id="87"

## 1.3.20 🚀

@milestone id="86"

## 1.3.17 🚀

@milestone id="85"

## 1.3.15 🚀

@milestone id="84"

## 1.3.12 🚀

@milestone id="83"

## 1.3.8 🚀

@milestone id="82"

## 1.3.7 🚀

@milestone id="81"

## 1.3.6 🚀

@milestone id="80"

## 1.3.4 🚀

@milestone id="79"

## 1.3.2 🚀

@milestone id="78"

## 1.3.0 🚀

@milestone id="77"

## 1.2.5 🚀

@milestone id="76"

## 1.2.4 🚀

@milestone id="75"

## 1.2.3 🚀

@milestone id="74"

## 1.2.2 🚀

@milestone id="73"

## 1.2.1 🚀

@milestone id="72"

## 1.2.0 🚀

@milestone id="71"

## 1.1.0 🚀

@milestone id="70"

## 1.0.0 🚀

@milestone id="69"

## 0.9.0 🚀

@milestone id="67"

## 0.8.1 🚀

@milestone id="66"

## 0.8.0 🚀

@milestone id="65"

## 0.7.3 🚀

@milestone id="64"

## 0.7.1 🚀

@milestone id="64"

## 0.7.0 🚀

@milestone id="63"

## 0.6.4 🚀

@milestone id="62"

## 0.6.3 🚀

@milestone id="61"

## 0.6.2 🚀

@milestone id="60"

## 0.6.1 🚀

@milestone id="59"

## 0.6.0 🚀

@milestone id="58"

## 0.4.12 🚀

@milestone id="56"

## 0.4.10 🚀

@milestone id="54"

## 0.4.9 🚀

@milestone id="53"

## 0.4.8 🚀

@milestone id="52"

## 0.4.7 🚀

@milestone id="51"

## 0.4.6 🚀

@milestone id="50"

## 0.4.5 🚀

@milestone id="49"

## 0.4.4 🚀

@milestone id="48"

## 0.4.3 🚀

@milestone id="47"

## 0.4.1 🚀

@milestone id="45"

## 0.4.0 🚀

@milestone id="44"

## 0.3.22 🚀

@milestone id="43"

## 0.3.21 🚀

@milestone id="42"

## 0.3.20 🚀

@milestone id="41"

## 0.3.19 🚀

@milestone id="40"

## 0.3.17 🚀

@milestone id="39"

## 0.3.16 🚀

@milestone id="38"

## 0.3.15 🚀

@milestone id="37"

## 0.3.14 🚀

@milestone id="36"

## 0.3.13 🚀

@milestone id="35"

## 0.3.12 🚀

@milestone id="34"

## 0.3.11 🚀

@milestone id="33"

## 0.3.10 🚀

@milestone id="32"

## 0.3.7 🚀

@milestone id="31"

## 0.3.6 🚀

@milestone id="30"

## 0.3.4 🚀

@milestone id="29"

## 0.3.3 🚀

@milestone id="28"

## 0.3.2 🚀

@milestone id="27"

## 0.3.1 🚀

@milestone id="26"

Rename `rowInfo.flatRowInfoArray` to `rowInfo.deepRowInfoArray`

## 0.3.0 🚀

@milestone id="25"

## 0.3.0-canary.0 🚀

New virtualization engine implemented for better performance.

## 0.2.20 🚀

@milestone id="24"

## 0.2.18 🚀

@milestone id="22"

## 0.2.17 🚀

@milestone id="21"

## 0.2.16 🚀

@milestone id="20"

## 0.2.15 🚀

@milestone id="19"

## 0.2.14 🚀

@milestone id="18"

## 0.2.13 🚀

@milestone id="17"

## 0.2.12 🚀

@milestone id="16"

## 0.2.11 🚀

@milestone id="15"

## 0.2.10 🚀

@milestone id="14"

## 0.2.9 🚀

@milestone id="13"

## 0.2.8 🚀

@milestone id="12"

## 0.2.7 🚀

@milestone id="11"

## 0.2.6 🚀

@milestone id="9"

## 0.2.5 🚀

@milestone id="8"

## 0.2.4 🚀

@milestone id="7"

## 0.2.0 🚀

- Implement initial support for [server-side pivoting](/docs/learn/grouping-and-pivoting/pivoting/overview)

## 0.1.0 🚀

This release introduces several breaking changes:

- `DataSource.groupRowsBy` has been renamed to <DataSourcePropLink name="groupBy"/>
- `InfiniteTable.columnAggregations` has been removed and you have to use <DataSourcePropLink name="aggregationReducers" />

@milestone id="5"

## 0.0.10 🚀

@milestone id="4"

## 0.0.9 🚀

@milestone id="3"

## 0.0.7 🚀

@milestone id="2"

## 0.0.5 🚀

@milestone id="1"
