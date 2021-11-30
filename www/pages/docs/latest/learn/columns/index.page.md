---
title: Working with Columns
---

Columns are a central feature in `InfiniteTable`. You define columns as a `Map<string, InfiniteTableColumn<DATA_TYPE>>` and then use pass them in the `columns` prop in your `InfiniteTable` component.


<Note>

In `InfiniteTable`, columns are identified by their key in the <PropLink name="columns" /> Map. **We'll refer to this as the column id**.
The column ids are used in many places - like defining the <PropLink name="columnOrder" code={false} />, column pinning, column visibility, etc. 

</Note>

```ts
export type Employee = {
  id: number;
  companyName: string;
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  department: string;
  team: string;
  salary: number;
  
};

// InfiniteTableColumn is a generic type, you have to bind it to a specific data-type
import { InfiniteTableColumn } from '@infinite-table/infinite-react';

export const columns = new Map<
  string,
  // we're binding it here to the `Employee` type
  // which means the `column.field` has to be `keyof Employee`
  InfiniteTableColumn<Employee>
>([
  [
    'firstName',
    {
      field: 'firstName',
      header: 'First Name',
    },
  ],
  [
    'country',
    {
      field: 'country',
    },
  ],

  [
    'city',
    {
      field: 'city'
    },
  ],
  [
    'salary',
    {
      field: 'salary',
      type: 'number'
    },
  ],
]);

<InfiniteTable columns={columns} />
```

<Gotcha>

It's very important to remember you should not pass a different reference of a prop on each render. `<InfiniteTable />` is a optimized to only re-render when props change - so if you change the props on every re-render you will get a performance penalty.

You should use `React.useCallback` / `React.useMemo` / `React.useState` to make sure you only update the props you pass down to `InfiniteTable` when you have to.

</Gotcha>

<Sandpack title="Basic Column Configuration">

```ts file=basic-columns-example.page.tsx
```

</Sandpack>

## Column Types

For now there are only 2 <PropLink code={false} name="columns.type">column types</PropLink>, but more are coming soon:
 * `string` - the default type, if none is specified.
 * `number`

Specifying the correct column type will ensure the correct sorting function is used.

## Column Order

The implicit column order is the order in which columns have been defined in the <PropLink name="columns" /> Map. You can however control that explicitly by using the `columnOrder: string[]` prop.

The <PropLink name="columnOrder" /> prop is an array of strings, representing the column ids. A column id is the key of the column in the <PropLink name="columns" /> Map.

<Note>

The <PropLink name="columnOrder" /> array can contain identifiers that are not yet defined in the <PropLink name="columns" /> Map, or can contain duplicate ids. This is a feature, not a bug. We want to allow you to use the <PropLink name="columnOrder" /> in a flexible way so it can define the order of current and future columns.

</Note>

<Note>
<PropLink name="columnOrder" /> is a controlled prop. For uncontrolled version, see <PropLink name="defaultColumnOrder" />
</Note>

<Sandpack title="Column Order demo, with firstName col displayed twice">

```tsx file=../../reference/columnOrder-example.page.tsx
```
</Sandpack>

