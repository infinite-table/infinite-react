---
title: Lazy Loading
---

With `InfiniteTable` you can lazily load data on demand - loading data is triggered by the user scrolling to a certain visible row range. So when the user stopped scrolling (after <PropLink name="scrollStopDelay" /> ms passed), the `DataSource` is loading the records that are in the viewport. Also, the table will render as if all the remote data is loaded into viewport - so the scroll height is correspondingly set.

We call this `"lazy loading"`, and it needs to be enabled by specifying the <DataSourcePropLink name="lazyLoad">DataSource.lazyLoad</DataSourcePropLink> prop.

<Sandpack title="Lazy loading ungrouped and unpivoted data">

```ts file="simple-lazy-load-example.page.tsx"

```

</Sandpack>

<Note>

The <DataSourcePropLink name="lazyLoad">DataSource.lazyLoad</DataSourcePropLink> prop can be either a boolean or an object with a `batchSize: number` property. If `batchSize` is not specified, it will load all records from the current row group (makes sense for grouped and/or pivoted data). For ungrouped and unpivoted data, make sure you set `batchSize` to a conveninent number.

Simply specifying `lazyLoad=true` makes more sense for grouped (or/and pivoted) data, where you want to load all records from the current level at once. If you want configure it this way, new data will only be requested when a group row is expanded.

</Note>

For lazy loading to work, the <DataSourcePropLink name="data" /> function in the `<DataSource/>` component must return a Promise that resolves to an an object with `data` and `totalCount` properties.

```tsx
{
  data: [ ... ],
  totalCount: 10000
}
```

The <DPropLink name="data">DataSource.data</DPropLink> function will be called with an object with the following properties:

- `sortInfo` - details about current sorting state
- `pivotBy` - an array that describes the current pivot state
- `aggregationReducers` - an object with the aggregation to apply to the data
- `groupBy` - array that specifies the current grouping information
- `groupKeys` - an array of the current group keys (if grouping is enabled). This uniquely identifies the current group.

- `lazyLoadStartIndex` - the index (in the total remote datasource) of the first record to be loaded
- `lazyLoadBatchSize` - the number of records to be loaded in this batch

<HeroCards>
<YouWillLearnCard title="Server-side Grouping Rows" path="/docs/learn/grouping-and-pivoting/grouping-rows#server-side-grouping-with-lazy-loading">
Find out about server-side grouping
</YouWillLearnCard>
<YouWillLearnCard title="Pivoting" path="/docs/learn/grouping-and-pivoting/pivoting/overview#server-side-pivoting">
Find out about server-side pivoting
</YouWillLearnCard>
</HeroCards>

## How lazy loading fetches data

When lazy loading is enabled, and the <DPropLink name="sortInfo" />  changes (eg: user clicks on a column header), the DataGrid will discard current data and call the <DPropLink name="data" /> function prop again, to fetch the new data. The same happens when the <DPropLink name="filterValue" /> or <DPropLink name="groupBy" /> changes. This is done automatically by the component, and you don't need to do anything.

<Sandpack title="Lazy loading grouped data" viewMode="preview">

<Description>

This demo lazily loads grouped data as the user scrolls down. Expand some groups to see the lazy loading in action.

When the user stops scrolling, after <PropLink name="scrollStopDelay" /> milliseconds, the DataGrid will fetch the next batch of data from the server.

</Description>

```ts file="grouped-lazy-load-example.page.tsx"

```

</Sandpack>


<Note>

Batching also happens for groups - when a group is expanded, the DataGrid will fetch the first batch of data in the expanded group and then fetch additional batches as the user scrolls down. When scrolling goes beyound the group, the DataGrid is smart enough to request a batch of data from sibling groups.

</Note>

<Note>

Lazy loading when grouping is enabled needs data for non-leaf rows to be in another format (as opposed to the format used for non-grouped data or for the non-grouped scenario). See example above for details.

For more docs on this, read [Server side grouping with lazy loading](/docs/learn/grouping-and-pivoting/grouping-rows#server-side-grouping-with-lazy-loading).

</Note>