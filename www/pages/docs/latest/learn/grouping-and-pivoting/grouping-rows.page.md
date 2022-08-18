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

```tsx {4}
const groupBy = [
  {
    field: 'country',
    column: { // custom column configuration for group column
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

```tsx {5}
const groupBy = [
  {
    field: 'country',
    column: {
      renderValue: ({ value }) => <>Country: {value}</>,
    }
  }
]
```

<Note>

The generated group column(s) - can be one for all groups or one for each group - will inherit the `style`/`className`/renderers from the columns corresponding to the group fields themselves (if those columns exist).

Additionally, there are other ways to override those inherited configurations, in order to configure the group columns:
 * use <PropLink name="groupBy.column" /> to specify how each grouping column should look for the respective field (in case of <PropLink name="groupRenderStrategy">groupRenderStrateg="multi-column"</PropLink>)
 * use <PropLink name="groupColumn" /> prop 
    * can be used as an object - ideal for when you have simple requirements and when <PropLink name="groupRenderStrategy">groupRenderStrateg="single-column"</PropLink>
    * as a function that returns a column configuration - can be used like this in either single or multiple group render strategy

</Note>

## Grouping strategies

Multiple grouping strategies are supported by, `InfiniteTable` DataGrid:
 * multi column mode - multiple group columns are generated, one for each specified group field
 * single column mode - a single group column is generated, even when there are multiple group fields
 <!-- * inline mode -->

You can specify the rendering strategy explicitly by setting the <PropLink name="groupRenderStrategy" /> property to any of the following: `multi-column`, `single-column`. If you don't set it explicitly, it will choose the best default based on your configuration.
<!-- or `inline`. -->

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

You can group by multiple fields, yet only render a single group column. To choose this rendering strategy, specify <PropLink name="groupRenderStrategy" /> property to be `single-column` (or specify <PropLink name="groupColumn" /> as an object.)


In this case, you can't override the group column for each group field, as there's only one group column being generated. However, you can specify a <PropLink name="groupColumn" /> property to customize the generated column.

<Note>

By default the generated group column will "inherit" many of the properties (the column style or className or renderers) of the columns corresponding to the group fields (if such columns exist, because it's not mandatory that they are defined).

</Note>

 
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

You can specify an `id` for the single <PropLink name="groupColumn" />. This is helpful if you want to size this column (via <PropLink name="columnSizing" />) or pin it (via <PropLink name="columnPinning" />) or configure it in other ways. If no `id` is specified, it will default to `"group-by"`.

</Gotcha>

<!-- 

### Inline group column

When inline group rendering is used (<PropLink name="groupRenderStrategy" code={false}>groupRenderStrategy="inline"</PropLink>), the columns bound to the corresponding group by fields are used for rendering, so no group columns are generated. This way of rendering groups is only recommended when you're sure you have small groups (smaller than the number of rows visible in the viewport). 

-->

## Customizing the group column

There are many ways to customize the group column(s) and we're going to show a few of them below:

### Binding the group column to a `field`

By default, group columns only show values in the group rows - but they are normal columns, so why not bind them to a <PropLink name="columns.field" code={false}>field</PropLink> of the `DATA_TYPE`?


```tsx {6,11}
const groupColumn = {
  id: 'the-group', // can specify an id
  style: {
    color: 'tomato'
  },
  field: 'firstName' // non-group rows will render the first name
}
const columns = {
  theFirstName: {
    field: 'firstName',
    style: { // this style will also be applied in the group column,
      // since it is bound to this same `field`
      fontWeight: 'bold'
    }
  }
}
```

This makes the column display the value of the `field` in non-group/normal rows. Also, if you have another column bound to that `field`, the renderers/styling of that column will be used for the value of the group column, in non-group rows.

<Sandpack title="Bind group column to a field">

```ts file=../../reference/bind-group-column-to-field-example.page.tsx
```

</Sandpack>

### Use `groupColumn` to customize rendering

The <PropLink name="groupColumn" /> will inherit its own rendering and styling from the columns that are bound to the fields used in <DataSourcePropLink name="groupBy.field" />. However, you can override any of those properties so you have full control over the rendering process.


```tsx {3,6}
const groupColumn = {
  field: 'firstName',
  renderGroupValue: ({ value }) => {
    return `Group: ${value}`
  },
  renderLeafValue: ({ value }) => {
    return `First name: ${value}`
  }
}
```


<Sandpack title="Customize group column renderer">

<Description>

The column that renders the `firstName` has a custom renderer that adds a `.` at the end.
The group column is bound to the same `firstName` field, but specifies a different renderer, which will be used instead.

</Description>

```ts file=../../reference/group-column-custom-renderers-example.page.tsx
```

</Sandpack>


<HeroCards>
<YouWillLearnCard title="Column rendering" path="../columns/column-rendering">
Learn more about customizing column rendering via multiple renderer functions.
</YouWillLearnCard>
</HeroCards>


## Hiding columns when grouping

When grouping is enabled, you can choose to hide some columns. Here are the two main ways to do this:

 * use <PropLink name="hideColumnWhenGrouped" /> - this will make columns bound to the group fields be hidden when grouping is active
 * use <PropLink name="columns.defaultHiddenWhenGroupedBy" /> (also available on the column types, as <PropLink name="columnTypes.defaultHiddenWhenGroupedBy" />) - this is a column-level property, so you have more fine-grained control over what is hidden and when.

Valid values for <PropLink name="columns.defaultHiddenWhenGroupedBy" /> are:

 * `"*"` - when any grouping is active, hide the column that specifies this property
 * `true` - when the field this column is bound to is used in grouping, hides this column
 * `keyof DATA_TYPE` - specify an exact field that, when grouped by, makes this column be hidden
 * `{ [k in keyof DATA_TYPE]: true}` - an object that can specify more fields. When there is grouping by any of those fields, the current column gets hidden.

 
<Sandpack title="Hide columns when grouping">

<Description>

In this example, the column bound to `firstName` field is set to hide when any grouping is active, since the group column is anyways found to the `firstName` field.

In addition, <PropLink name="hideColumnWhenGrouped" /> is set to `true`, so the `stack` and `preferredLanguage` columns are also hidden, since they are grouped by.

</Description>

```ts file=../../reference/hide-columns-when-grouping-example.page.tsx
```

</Sandpack>


## Sorting the group column

When <PropLink name="groupRenderStrategy">groupRenderStrategy="single-column"</PropLink> is used, the group column is sortable by default if all the columns that are involved in grouping are sortable. Sorting the group column makes the `sortInfo` have a value that looks like this:


```ts
const sortInfo = [
  { field: ['stack','age'], dir: 1, id: 'group-by', }
]
```

 <PropLink name="groupRenderStrategy">groupRenderStrategy="multi-column"</PropLink>, each group column is sortable by default if the column with the corresponding field is sortable.

 <Note>

 Both in single and multi group column render strategy, the <PropLink name="columns.sortable" /> property can be used to override the default behavior.

 </Note>

<Sandpack title="Group column with initial descending sorting">

```ts file=../../reference/group-column-sorted-initially-example.page.tsx
```

</Sandpack>


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
* `reducer: string | (acc, current, data: DATA_TYPE, index)=>value` - the reducer function to use when computing the aggregation (for client-side aggregations only). For server-side aggregations, this will be a `string`
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