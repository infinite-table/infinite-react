---
title: Lazy Loading
---

With `InfiniteTable` you can lazily load data on demand - loading data is triggered by the user scrolling to a certain visible row range. So when the user stopped scrolling (after <PropLink name="scrollStopDelay" /> ms passed), the `DataSource` is loading the records that are in the viewport. Also, the table will render as if all the remote data is loaded into viewport - so the scroll height is correspondingly set.

We call this `"lazy loading"`, and it needs to be enabled by specifying the <DataSourcePropLink name="lazyLoad">DataSource.lazyLoad</DataSourcePropLink> prop.


<Sandpack title="Lazy loding ungrouped and unpivoted data">

```ts file=simple-lazy-load-example.page.tsx
```
</Sandpack>

<Note>

The <DataSourcePropLink name="lazyLoad">DataSource.lazyLoad</DataSourcePropLink> prop can be either a boolean or an object with a `batchSize: number` property. If `batchSize` is not specified, it will load all records from the current row group (makes sense for grouped and/or pivoted data). For ungrouped and unpivoted data, make sure you `batchSize` to a conveninent number.

Simply specifying `lazyLoad=true` makes more sense for grouped (or/and pivoted) data, where you want to load all records from the current level at once. If you want configure it this way, new data will only be requested when a group row is expanded.

</Note>

For lazy loading to work, the <DataSourcePropLink name="data" /> function in the `<DataSource/>` component must return a Promise that resolves to an an object with `data` and `totalCount` properties.

```tsx
{
  data: [ ... ],
  totalCount: 10000
}
```
The `DataSource.data` function will be called with an object with the following properties:

 * `sortInfo` - details about current sorting state
 * `pivotBy` - an array that describes the current pivot state
 * `aggregationReducers` - an object with the aggregation to apply to the data
 * `groupBy` - array that specifies the current grouping information
 * `groupKeys` - an array of the current group keys (if grouping is enabled). This uniquely identifies the current group.

 * `lazyLoadStartIndex` - the index (in the total remote datasource) of the first record to be loaded
 * `lazyLoadBatchSize` - the number of records to be loaded in this batch


 ## Server side grouping with lazy loading

 Lazy loading becomes all the more useful when working with grouped data.
 
 The `DataSource` <DataSourcePropLink name="data"/> function is called with an object that has all the information about the current `DataSource` state(grouping/pivoting/sorting/lazy-loading, etc) - see the paragraphs above for details.

 Server side grouping needs two kinds of data responses in order to work properly:

  * response for **non-leaf row groups** - these are groups that have children. For such groups (including the top-level group), the `DataSource.data` function must return a promise that's resolved to an object with the following properties:
    * `totalCount` - the total number of records in the group
    * `data` - an array of objects that describes non-leaf child groups, each object has the following properties:
      * `keys` - an array of the group keys (usually strings) that uniquely identifies the group, from the root to the current group
      * `data` - an object that describes the common properties of the group 
      * `aggregations` - an object that describes the aggregations for the current group
  * response for **leaf rows** - these are normal rows - rows that would have been served in the non-grouped response. The resolved object should have the following properties:
    * `data` - an array of objects that describes the rows
    * `totalCount` - the total number of records on the server, that are part of the current group

Here's an example, that assumes grouping by `country` and `city` and aggregations by `age` and `salary` (average values):

```tsx
//request:
groupKeys: [] // empty keys array, so it's a top-level group
groupBy: [{"field":"country"},{"field":"city"}]
reducers: [{"field":"salary","id":"avgSalary","name":"avg"},{"field":"age","id":"avgAge","name":"avg"}]
// lazyLoadStartIndex: 0, - passed if lazyLoad is configured with a batchSize
// lazyLoadBatchSize: 20 - passed if lazyLoad is configured with a batchSize

//response
{
  cache: true,
  totalCount: 20,
  data: [
    {
      data: {country: "Argentina"},
      aggregations: {avgSalary: 20000, avgAge: 30},
      keys: ["Argentina"],
    },
    {
      data: {country: "Australia"},
      aggregations: {avgSalary: 25000, avgAge: 35},
      keys: ["Australia"],
    }
    //...
  ]
}
```

Now let's expand the first group and see how the request/response would look like:

```tsx

//request:
groupKeys: ["Argentina"]
groupBy: [{"field":"country"},{"field":"city"}]
reducers: [{"field":"salary","id":"avgSalary","name":"avg"},{"field":"age","id":"avgAge","name":"avg"}]

//response
{
  totalCount: 4,
  data: [
    {
      data: {country: "Argentina", city: "Buenos Aires"},
      aggregations: {avgSalary: 20000, avgAge: 30},
      keys: ["Argentina", "Buenos Aires"],
    },
    {
      data: {country: "Argentina", city: "Cordoba"},
      aggregations: {avgSalary: 25000, avgAge: 35},
      keys: ["Argentina", "Cordoba"],
    },
    //...
  ]
}
```
Finally, let's have a look at the leaf/normal rows and a request for them:

```tsx

//request
groupKeys: ["Argentina","Buenos Aires"]
groupBy: [{"field":"country"},{"field":"city"}]
reducers: [{"field":"salary","id":"avgSalary","name":"avg"},{"field":"age","id":"avgAge","name":"avg"}]

//response
{
  totalCount: 20,
  data: [
    {
      id: 34,
      country: "Argentina",
      city: "Buenos Aires",
      age: 30,
      salary: 20000,
      stack: "full-stack",
      firstName: "John",
      //...
    },
    {
      id: 35,
      country: "Argentina",
      city: "Buenos Aires",
      age: 35,
      salary: 25000,
      stack: "backend",
      firstName: "Jane",
      //...
    },
    //...
  ]
}
```

<Note>

When a row group is expanded, since `InfiniteTable` has the group `keys` from the previous response when the node was loaded, it will use the `keys` array and pass them to the `DataSource.data` function when requesting for the children of the respective group.

You know when to serve last-level rows, because in that case, the length of the `groupKeys` array will be equal to the length of the `groupBy` array.

</Note>

<Sandpack title="Server side grouping with lazy loding">

```ts file=server-side-grouping-with-lazy-load-example.page.tsx
```
</Sandpack>

## Server-side pivoting with lazy-load

Pivoting builds on the same data response as server-side grouping, but adds the pivot values for each group, as we'll explain below. Another difference is that in pivoting, no leaf rows are rendered or loaded, since this is pivoting and only aggregated data. This means the `DataSource.data` function must always return the same format for the response data.

Docs coming soon