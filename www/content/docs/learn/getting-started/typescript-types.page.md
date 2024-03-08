---
title: TypeScript Types
description: Infinite Table types for TypeScript are published as part of the package, as named exports from the root of the package.
---

Our `TypeScript` types are published as part of the package, as named exports from the root of the package.

The 2 main components that you can need to use and import are:

- `InfiniteTable`
- `DataSource`

```tsx title="Importing_InfiniteTable_and_DataSource"
import { InfiniteTable, DataSource } from '@infinite-table/infinite-react';
```

<Note>

In our TypeScript typings, those components are exported as generic components, so they need to be bound to the type of the data they are rendering.

```tsx
type Developer = {
  id: number;

  firstName: string;
  lastName: string;

  currency: string;
  salary: number;
}

const App = () => {
  return <DataSource<Developer> data={data} primaryKey="id">
    <InfiniteTable<Developer>
      columns={{...}}
    />
  </DataSource>
}
```

Throughout the documentation, we will use the `DATA_TYPE` placeholder to refer to the type of the data that the `InfiniteTable` and `DataSource` components are bound to.

</Note>

<Note>

You can still use `InfiniteTable` in plain JavaScript, but you won't get all the type-checking benefits.

</Note>

Both `InfiniteTable` and `DataSource` components have types provided for most of the props they support. Generally the naming pattern is `<COMPONENT_NAME>Prop<PROP_NAME>`, so here are a few examples to clarify the rule:

```ts
import type {
  InfiniteTablePropColumns,
  // corresponding to the `columns` prop
  DataSourcePropGroupBy,
  // corresponding to the `groupBy` prop
} from '@infinite-table/infinite-react';
```

## `DataSource` Types

Here are a few examples for types for the `DataSource` component:

- `DataSourcePropGroupBy<DATA_TYPE>` - the type for <DPropLink name="groupBy">DataSource.groupBy</DPropLink>

```tsx
import type { DataSourcePropGroupBy } from '@infinite-table/infinite-react';
```

- `DataSourcePropAggregationReducers<DATA_TYPE>` - the type for <DPropLink name="aggregationReducers">DataSource.aggregationReducers</DPropLink>

```tsx
import type { DataSourcePropAggregationReducers } from '@infinite-table/infinite-react';
```

<Note>

Not all the `DataSource` props have types exported that follow this convention, so you can always use `DataSourceProps<DATA_TYPE>` to get the type that define all the props.

In this way you can access specific prop types by name

- `DataSourceProps<DATA_TYPE>['groupBy']` - the type for <DPropLink name="groupBy">DataSource.groupBy</DPropLink>
- `DataSourceProps<DATA_TYPE>['data']` - the type for <DPropLink name="data">DataSource.data</DPropLink>
- etc

</Note>

## `InfiniteTable` Types

Below you can find a few examples for types for the `InfiniteTable` component:

- `InfiniteTablePropColumns<DATA_TYPE>` - the type for <PropLink name="columns">InfiniteTable.columns</PropLink>

```tsx
import type { InfiniteTablePropColumns } from '@infinite-table/infinite-react';
```

- `InfiniteTablePropRowStyle<DATA_TYPE>` - the type for <PropLink name="rowStyle">InfiniteTable.rowStyle</PropLink>

```tsx
import type { InfiniteTablePropRowStyle } from '@infinite-table/infinite-react';
```

- `InfiniteTablePropColumnGroups<DATA_TYPE>` - the type for <PropLink name="columnGroups">InfiniteTable.columnGroups</PropLink>

```tsx
import type { InfiniteTablePropColumnGroups } from '@infinite-table/infinite-react';
```

<Note>

Not all the `InfiniteTable` props have types exported that follow this convention, so you can always use `InfiniteTableProps<DATA_TYPE>` to get the type that define all the props the `InfiniteTable` component supports.

In this way you can access specific prop types by name:

- `InfiniteTableProps<DATA_TYPE>['columns']` - the type for <PropLink name="columns">InfiniteTable.columns</PropLink>
- `InfiniteTableProps<DATA_TYPE>['columnSizing']` - the type for <PropLink name="columnSizing">InfiniteTable.columnSizing</PropLink>
- etc

</Note>

<Note>

Worth mentioning is the `InfiniteTableColumn<DATA_TYPE>` prop, which defines the type for the table <PropLink name="columns" />.

</Note>
