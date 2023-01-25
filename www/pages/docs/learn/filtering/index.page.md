---
title: Filtering
---

Filtering allows you to limit the rows available in the table.

Both client-side and server-side filtering are available in Infinite Table - but the way the are configured is pretty similar, so this page documents the common parts, while pointing to the respective pages for the differences.

## Configuring Filters for Columns

The most common way to use filtering in Infinite Table is by configuring filters for columns (this works both for client-side and server-side filtering).

You specify an uncontrolled <DPropLink name="defaultFilterValue" /> on the `<DataSource />` component (or the controlled version, <DPropLink name="filterValue" />) and the specified value will be used as the initial filter.

Based on the <PropLink name="columns.type" code={false}>column type</PropLink>, the correct filter editor is displayed in the column header, along with the correct operator icon. In the UI, you can change the operator being used for the filter.

```tsx title=Specifying_an_initial_filter_value_for_the_DataSource
<DataSource<Developer>
  data={...}
  defaultFilterValue={[
    {
      field: 'age',
      filter: {
        operator: 'gt',
        value: 30,
        type: 'number'
      }
    }
  ]}
>
  <InfiniteTable<Developer>
    columns={...}
  />
</DataSource>
```

<Note>

If you don't need to specify some initial filters, but want the column filter bar to be visible, you need to specify `defaultFilterValue = []` (or the controlled `filterValue = []`).

Specifying any of those props will make the column filter bar visible.

Whenever filters change, <DPropLink name="onFilterChange" /> will be called with the new filter value - note however, it might not be called immediately, due to the <DPropLink name="filterDelay" /> prop.

</Note>

The above snippet will show a `number` filter for the `age` column. There are two filter types available at this stage in Infinite Table:

 * `string` - with the following operators available: `contains`, `eq`, `startsWith` and `endsWith`
 * `number` - with the following operators available: `eq`,`neq`, `gt`, `gte`, `lt` and `lte`

## Defining Filterable Columns

By default, all columns are filterable.

If you want to make columns by default not filterable, use the <PropLink name="columnDefaultFilterable" /> prop and set it to `false`.

 You can specifically configure each column by using the <PropLink name="columns.defaultFilterable">defaultFilterable</PropLink> property - this overrides the global <PropLink name="columnDefaultFilterable" /> prop.

## Understanding Filter Types

A filter type is a concept that defines how a certain type of data is to be filtered.
A filter type will have
 - a `key` - the key used to define the filter in the <DPropLink name="filterTypes" /> object
 - a `label`,
 - an array of values considered to be empty values - when any of these values is used in the filter, the filter will not be applied.
 - an array of `operators`
 - a default operator.

Let's imagine you have a `DataSource` with developers, each with a `salary` column, and for that column you want to allow `>`, `>=`, `<` and `<=` comparisons (operators).

For this, you would define the following filter type:

```tsx

const filterTypes = {
  income: {
    label: 'Income', 
    emptyValues: ['', null, undefined],
    defaultOperator: 'gt',
    operators: [
      {
        name: 'gt',
        label: 'Greater than',
        fn: ({ currentValue, filterValue, emptyValues }) => {
          if (emptyValues.has(currentValue)) {
            return true;
          }
          return currentValue > filterValue;
        }
      },
      {
        name: 'gte',
        //...
      },
      {
        name: 'lt',
        //...
      },
      {
        name: 'lte',
        //...
      }
    ]
  }
}
```

<Note>

Each operator for a certain filter type needs to at least have a `name` and `fn` defined. The `fn` property is a function that will be called when client-side filtering is enabled, with an object that has the following properties:
 - `currentValue` - the cell value of the current row for the column being filtered
 - `filterValue` - the value of the filter editor
 - `emptyValues` - the array of values considered to be empty values for the filter type
 - `data` - the current row data object - `typeof DATA_TYPE`
 - `index` - the index of the current row in the table - `number`
 - `dataArray` - the array of all rows originally in the table - `typeof DATA_TYPE[]`
 - `field?` - the field the current column is bound to (can be undefined if the column is not bound to a field)

</Note>



<Sandpack title="Client-side filtering in action with custom filter type">

<Description>

The `salary` column has a custom filter type, with the following operators: `gt`, `gte`, `lt` and `lte`.

</Description>

```ts file=filter-custom-filter-type-example.page.tsx
```

</Sandpack>


## Specifying the filter mode

As already mentioned, filtering can happen either client-side or server-side. If the DataSource <DPropLink name="data" /> property is a function (and not an array or a `Promise`), then the filtering will happen server-side by default.

However, you can explicitly specify where the filtering should happen by setting the <DPropLink name="filterMode" /> property on the `<DataSource />` component - possible values are

 - `filterMode="local"` - filtering will happen client-side
 - `filterMode="remote"` - filtering will happen remotely and the <DPropLink name="filterValue" /> will be passed as a property to the parameter object sent to the <DPropLink name="data"/> function.


<Note title="Filter mode ⚠️">

Explicitly specify <DPropLink name="filterMode" /> as either `"local"` or `"remote"` if you want to change the default behavior.

</Note>

## Filtering Columns Not Bound to a Field

If a column is not bound to a `field`, it can still be used for filtering, even client-side filtering, if it is configured with a <PropLink name="columns.valueGetter" />.

<Note>

If you don't need a default filter value, the <DPropLink name="filterValue" /> that's set when the user interacts with the column filter will use the column <PropLink name="columns.valueGetter">valueGetter</PropLink> to filter values.

If however, you need initial filtering by that column, the <DPropLink name="filterValue" /> needs to specify a `valueGetter` itself.

```tsx
defaultFilterValue={[
  {
    id: 'salary',
    valueGetter: ({ data }) => data.salary,
    filter: {
      operator: 'gt',
      value: '',
      type: 'number',
    }
  },
]}
```

</Note>

<Sandpack title="Filtering a column not bound to a field">

<Description>

The `salary` column is not bound to a `field` - however, it can still be used for filtering, as it's configured with a `valueGetter`.

</Description>

```ts file=filter-column-with-id-example.page.tsx
```

</Sandpack>


## Customizing the Filter Icon for Columns

Columns can customize the filter icon by using the <PropLink name="columns.renderFilterIcon" /> property.

<Sandpack title="Custom filter icons for salary and name columns">

<Description>

The `salary` column will show a bolded label when filtered.

The `firstName` column will show a custom filter icon when filtered.

</Description>

```ts file=$DOCS/learn/columns/column-filter-icon-example.page.tsx
```

</Sandpack>

<HeroCards>
<YouWillLearnCard title="Client-side filtering" path="./filtering/filtering-client-side">
Learn how to use filtering in the browser.
</YouWillLearnCard>
<YouWillLearnCard title="Server-side filtering" path="./filtering/filtering-server-side">
Figure out how to use filtering with server-side integration.
</YouWillLearnCard>
</HeroCards>

