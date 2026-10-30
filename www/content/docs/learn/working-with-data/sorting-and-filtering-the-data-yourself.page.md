---
title: Sorting and Filtering the Data Yourself
description: Pass data you already sorted and filtered to the Infinite Table DataSource - from your own code, a server, or a data-fetching library like TanStack Query
---

By default, the `<DataSource />` sorts and filters the data in the browser - for array data, for a `Promise`, for a <DPropLink name="data" /> function, and also when <DPropLink name="sortInfo" /> or <DPropLink name="filterValue" /> are controlled.

When you sort or filter the data yourself - on a server, in a data-fetching library like TanStack Query, or in your own code - tell the `<DataSource />` not to do it again, with <DPropLink name="shouldReloadData" />:

```tsx
<DataSource<Developer>
  primaryKey="id"
  data={rows}
  sortInfo={sortInfo}
  onSortInfoChange={setSortInfo}
  filterValue={filterValue}
  onFilterValueChange={setFilterValue}
  shouldReloadData={{ sortInfo: true, filterValue: true }}
/>
```

- with a <DPropLink name="data" /> function, it's called again on every sort or filter change, with the `sortInfo` and `filterValue` in its params;
- with array data, you pass a new array every time the sorting or the filtering changes (eg from <DPropLink name="onSortInfoChange" /> and <DPropLink name="onFilterValueChange" />).

Either way, the rows are shown as they come in - they are not sorted or filtered again in the browser.

<Note>

Grouping and pivoting are always done in the browser - unless you use <DPropLink name="lazyLoad" />, where the server returns the groups.

</Note>

## Reusing the built-in sorting and filtering

To sort and filter the data the same way the `<DataSource />` does, use the functions it uses:

- `multisort(sortInfo, array)` - the built-in sorting for flat data (it sorts the array in place, so pass a copy);
- `defaultFilterFunction(param)` - the built-in column filtering for one row. It needs the row, its index, the array, the primary key, and the column filters with their filter types - the default `filterTypes` are exported too.

```ts
import {
  defaultFilterFunction,
  filterTypes,
  multisort,
} from '@infinite-table/infinite-react';

function sortAndFilter(rows, sortInfo, filterValue) {
  const filtered = rows.filter((data, index, dataArray) =>
    defaultFilterFunction({
      data,
      index,
      dataArray,
      primaryKey: data.id,
      filterValue,
      filterTypes,
    }),
  );
  return multisort(sortInfo, filtered);
}
```

If you configure custom <DPropLink name="filterTypes" /> on the `<DataSource />`, pass the same ones to `defaultFilterFunction`.

## With TanStack Query

The query key includes the sorting and the filtering, so every change runs a new query. Thanks to `placeholderData: keepPreviousData`, the previous rows stay on screen until the new ones arrive - and because the `<DataSource />` doesn't sort or filter them itself, they don't change until the query resolves.

<Sandpack title="Sorting and filtering with TanStack Query" deps="@tanstack/react-query">

```ts file="owner-processed-with-react-query-example.page.tsx"

```

</Sandpack>
