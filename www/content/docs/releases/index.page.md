---
title: Releases
description: All releases | Infinite Table DataGrid for React
---

## 7.4.0

Add custom tracks in Chrome DevTools performance profiler. Read our blogpost on [/blog/2025/10/20/debugging-your-datagrid-performance-with-custom-tracks-in-chrome-devtools-performance-profiler]

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
