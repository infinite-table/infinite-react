---
title: Grouping rows
---

You can use any `field` available in the `DataSource` to do the grouping - it can even be a `field` that is not a column.

<Note>

When using TypeScript, both `DataSource` and `InfiniteTable` components are generic and need to be rendered/instantiated with a `DATA_TYPE` parameter. The fields in that `DATA_TYPE` can then be used for grouping.

</Note>


```tsx
type Person = {
  name: string;
  age: number;
  country: string;
  id: string;
}

const groupBy = [{field: 'country'}]

<DataSource<Person> groupBy={groupBy}>
  <InfiniteTable<Person> />
</DataSource>

```
In the example above, we're grouping by `country`, which is a field available in the `Person` type. Specifying a field not defined in the `Person` type would be a type error.

Additionally, a `column` object can be used together with the `field` to define how the group column should be rendered.

```tsx
const groupBy = [
  {
    field: 'country',
    column: {
      width: 150,
      header: 'Country group',
    }
  }
]
```

The example below puts it all together.

Also see the <DataSourcePropLink name="groupBy" code={false}>groupBy API reference</DataSourcePropLink> to find out more.

<Sandpack title="Simple row grouping">

```ts file=row-grouping-example.page.tsx
```
```ts file=columns.ts
```
</Sandpack>

In `groupBy.column` you can use any column property - so, for example, you can define a custom `renderValue` function to customize the rendering.

```tsx
const groupBy = [
  {
    field: 'country',
    column: {
      renderValue: ({ value }) => <>Country: {value}</>,
    }
  }
]
```

## Grouping strategies

When you want to group by multiple fields, `InfiniteTable` offers multiple grouping strategies:
 * multi column mode - the default.
 * single column mode
 * inline mode

You can specify the rendering strategy by setting the <PropLink name="groupRenderStrategy" /> property to any of the following: `multi-column`, `single-column` or `inline`.


### Multiple groups columns

When grouping by multiple fields, by default the component will render a group column for each group field

```tsx
const groupBy = [
  {
    field: 'age',
    column: {
      width: 100,      
      renderValue: ({ value }) => <>Age: {value}</>,
    }
  },
  {
    field: 'companyName'
  },
  {
    field: 'country'
  }
]
```

Let's see an example of how the component would render the table with the multi-column strategy.

<Sandpack title="Multi-column group render strategy">

```ts file=row-grouping-multi-column-example.page.tsx
```
```ts file=columns.ts
```

</Sandpack>

For the `multi-column` strategy, you can use <PropLink name="hideEmptyGroupColumns" /> in order to hide columns for groups which are currently not visible.

<Sandpack title="Hide Empty Group Columns">

```ts file=../../reference/hideEmptyGroupColumns-example.page.tsx
```
```ts file=../../reference/employee-columns.ts as=employee-columns.ts
```

</Sandpack>

<Gotcha>

You can specify an `id` for group columns. This is helpful if you want to size those columns (via <PropLink name="columnSizing" />) or pin them (via <PropLink name="columnPinning" />) or configure them in other ways. If no `id` is specified, it will be generated like this: `"group-by-${field}"`

</Gotcha>

### Single group column

You can group by multiple fields, yet only render a single group column. To choose this rendering strategy, specify <PropLink name="groupRenderStrategy" /> property to be `single-column`.

In this case, you can't override the group column for each group field, as there's only one group column being generated. However, you can specify a <PropLink name="groupColumn" /> property to customize the generated column.
 
<Sandpack title="Single-column group render strategy">

```ts file=row-grouping-single-column-example.page.tsx
```
```ts file=columns.ts
```

</Sandpack>

<Note>

If <PropLink name="groupColumn" /> is specified to an object and no <PropLink name="groupRenderStrategy" /> is passed, the render strategy will be `single-column`.

<PropLink name="groupColumn" /> can also be a function, which allows you to individually customize each group column - in case the `multi-column` strategy is used.

</Note>


<Gotcha>

You can specify an `id` for the single group column by using <PropLink name="groupColumn" />, as detailed above. This is helpful if you want to size this column (via <PropLink name="columnSizing" />) or pin it (via <PropLink name="columnPinning" />) or configure it in other ways. If no `id` is specified, it will default to `"group-by"`.

</Gotcha>

### Inline group column

When inline group rendering is used (<PropLink name="groupRenderStrategy" code={false}>groupRenderStrategy="inline"</PropLink>), the columns bound to the corresponding group by fields are used for rendering, so no group columns are generated. This way of rendering groups is only recommended when you're sure you have small groups (smaller than the number of rows visible in the viewport).


## Aggregations

When grouping, you can also aggregate the values of the grouped rows. This is done via the <DataSourcePropLink name="aggregationReducers" code>DataSource.aggregationReducers=true</DataSourcePropLink> property. See the example below

<Sandpack title="Grouping with aggregations">

```ts file=grouping-with-aggregations-example.page.tsx
```

</Sandpack>

Each <DataSourcePropLink name="aggregationReducers" code={false}>reducer</DataSourcePropLink> from the `aggregationReducers` map can have the following properties:

* `field` - the field to aggregate on
* `getter(data)` - a value-getter function, if the aggregation values are are not mapped directly to a `field`
* `initialValue` - the initial value to start with when computing the aggregation (for client-side aggregations only)
* `reducer: string | (acc, current)=>value` - the reducer function to use when computing the aggregation (for client-side aggregations only). For server-side aggregations, this will be a `string`
* `done(value, arr)` - a function that is called when the aggregation is done (for client-side aggregations only) and returns the final value of the aggregation
* `name` - useful especially in combination with <DataSourcePropLink name="pivotBy" />, as it will be used as the pivot column header.

If an aggregation reducer is bound to a `field` in the dataset, and there is a column mapped to the same `field`, that column will show the corresponding aggregation value for each group row, as shown in the example above.

<Gotcha>

If you want to prevent the user to expand the last level of group rows, you can override the `render` function for the group column

<Sandpack title="Customized group expand on last group level">

```ts file=grouping-with-aggregations-discard-expand-example.page.tsx
```

</Sandpack>

</Gotcha>


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

## Eager loading for group row nodes

When using lazy-loading together with batching, node data (without children) is loaded when a node (normal or grouped) comes into view. Only when a group node is expanded will its children be loaded. However, you can do this loading eagerly, by using the `dataset` property on the node you want to load.

<Note>

This can be useful in combination with using `dataParams.groupRowsState` from the <DataSourcePropLink name="data"/> function - so your datasource can know which groups are expanded, and thus it can serve those groups already loaded with children.

</Note>


```tsx {18}
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
      // NOTE this dataset property used for eager-loading of group nodes
      dataset: {
        // the shape of the dataset is the same as the one normally returned by the datasource
        cache: true,
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
        ]
      }
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