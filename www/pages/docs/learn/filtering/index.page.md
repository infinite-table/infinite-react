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
      operator: 'gt',
      filterValue: 30,
      filterType: 'number'
    }
  ]}
>
  <InfiniteTable<Developer>
    columns={...}
  />
</DataSource>
```

<Note>

If you don't want to specify some initial filters, but still want the column filter bar to be visible, you can specify `defaultFilterValue = []` (or the controlled `filterValue = []`).

Specifying any of those props will make the column filter bar visible.

</Note>

The above snippet will show a `number` filter for the `age` column. There are two filter types available at this stage in Infinite Table:

 * `string` - with the following operators available: `contains`, `eq`, `startsWith` and `endsWith`
 * `number` - with the following operators available: `eq`,`neq`, `gt`, `gte`, `lt` and `lte`


## Understanding Filter Types

A filter type is a concept that defines how a certain type of data is to be filtered.
A filter type will have
 - a `key` - the key used to define the filter in the <DPropLink name="filterTypes" /> object
 - a `label`,
 - a Set of values considered to be empty values - when any of these values is used in the filter, the filter will match all records.
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
          if (emptyValues.includes(currentValue)) {
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

<HeroCards>
<YouWillLearnCard title="Client-side filtering" path="./filtering/filtering-client-side">
Learn how to use filtering in the browser.
</YouWillLearnCard>
<YouWillLearnCard title="Server-side filtering" path="./filtering/filtering-server-side">
Figure out how to use filtering with server-side integration.
</YouWillLearnCard>
</HeroCards>

