---
title: DataSource Types
description: TypeScript type definitions for the DataSource component of Infinite Table
---

These are types related to the `DataSource` component, that you can import with named imports from the `@infinite-table/infinite-react` package.

Additionally, there are other exported types, for example, related to the [InfiniteTable component](/docs/reference/infinite-table-types)


```tsx title="Importing the type for rowInfo"

import { DataSourceGroupBy} from '@infinite-table/infinite-react'

```

<Note title="Naming convention ⚠️">

The types of all properties in the `DataSource` component respect the following naming convention: `DataSourceProp<PropName>`

So, for example, the type for <DPropLink name="groupBy" /> is <DTypeLink name="DataSourcePropGroupBy" />

</Note>


<PropTable sort>

<Prop name="DataSourcePropGroupBy">

> The type of the <DPropLink name="groupBy" /> prop. Basically this type is an array of <DTypeLink name="DataSourceGroupBy" />.

</Prop>

<Prop name="DataSourceGroupBy">

> The type for the objects in the <DPropLink name="groupBy" /> array. See related <DTypeLink name="DataSourcePropGroupBy" />

<Note>

The type is generic, and the generic type parameter is the type of the data in the grid. In this documentation, either `DATA_TYPE` or `T` will be used to refer to the generic type parameter.

</Note>

These are the type properties:
- `field` - `keyof DATA_TYPE`. The field to group by.
- `column`: `Partial<InfiniteTableColumn>`
- `toKey?`: `(value: any, data: DATA_TYPE) => any` - a function that can be used to decide the bucket where each data object from the data set will be placed. If not provided, the `field` value will be used.

</Prop>

</PropTable>
