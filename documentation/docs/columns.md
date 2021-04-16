---
id: columns
title: Columns
sidebar_label: Columns
---

## Defining columns

Columns are defined as a `Map` of objects - the keys of the map are the column unique identifiers (short: column ids).

```ts
type Person = {
  firstName: string;
  lastName: string;
  id: string;
  age: number;
};

const aColumn: TableColumn<Person> = {
  field: "firstName",
};

const columns = new Map<string, TableColumn<Person>>([
  ["firstName", aColumn],
  // you can even reuse the same column definition
  // for a different column id
  ["anotherFirstName", aColumn],
  ["age", { render: ({ value }) => `Age: ${value}` }],
]);
```

:::important
At a minimum, a `column` should have one of the following properties:

- `field` - when specified, the column will render the corresponding field value for its cells
- `render` property - if `render({ value, data, column })` function is specified, it will just call it to render whatever it returns.

:::

## Column ordering

The order of columns is controlled by the `columnOrder: string[] | true` prop - it is an array of column ids (or the boolean true). If a column is not specified in the column order, it will not be visible. If you do not want to explicitly specify a column order, the default for this prop will be `true`, which means display all columns, in the default order in which they have been added to the `columns` map.

:::tip
You can use `columnOrder` (controlled or uncontrolled `defaultColumnOrder`) to control column visibility. However, for more granular control on column visibility, see the Column Visibility section below)
:::

```ts
const columns = new Map<string, TableColumn<Employee>>([
  ['id', { field: 'id' }],
  ['firstName', { field: 'firstName' }],
  ['lastName', { field: 'lastName' }],
]);
const columnOrder = ['lastName','firstName']
// make sure the columns and the columnOrder
// are not re-created on every render

<Table
  columnOrder={columnOrder}
  domProps={domProps}
  columns={columns}
/>
```

### Column reordering via d&d

By default, the table is configured with `draggableColumns=true` - which means all columns can be reordered via d&d. If you don't want to allow column dragging at table level, specify `draggableColumns=true`.

However, each column can override the table prop by specifying it's own `draggable` prop. If you want all columns to be draggable except one, specify `draggableColumns=true` at table level and `draggable=false` for that specific column.

:::caution
If you don't specify a column order or have an uncontrolled column order, dragging columns around will change the column order internally (you can be notified of the change via `onColumnOrderChange`).

However, if you add new columns to the columns collection, those will not be visible by default, since they are not in the column order. In this case, it is recommended that you either use controlled column order or use the imperative table API to update the internal column order of the table.
:::

```tsx
const columns = new Map<string, TableColumn<Employee>>([
  ["id", { field: "id", draggable: false }],
  ["firstName", { field: "firstName" }],
  ["lastName", { field: "lastName" }],
]);
<Table
  // all columns will be draggable by default,
  // except the id column, which overrides this flag
  draggableColumns={true}
  columns={columns}
/>;
```

## Column Visibility

For controlling column visibility, you can use the `columnVisibility` (controlled) and `defaultColumnVisibility` (uncontrolled) props. Those are `Map<string, false>` - meaning all the columns specified in this map will be hidden. The default value for those props is an empty map, which means all columns (that are included in the `columnOrder`) are visible by default. If you want to hide a column, specify the column id in the `columnVisibility` map, with a value of `false`.

:::tip
If you use a controlled `columnVisibility` prop, simply set/delete keys on the map and the table will react to the change and display the appropriate visible columns.
:::

```ts
const columns = new Map<string, TableColumn<Employee>>([
  ["id", { field: "id" }],
  ["firstName", { field: "firstName" }],
  ["lastName", { field: "lastName" }],
  ["age", { field: "age" }],
]);
// make the id and age columns invisible
const columnVisibility = new Map([
  ["id", false],
  ["age", false],
]);

const onColumnVisibilityChange = (columnVisibility) => {
  // console.log('hidden columns are', columnVisibility)
};

<Table
  defaultColumnVisibility={columnVisibility}
  onColumnVisibilityChange={onColumnVisibilityChange}
  domProps={domProps}
  columns={columns}
/>;
```

<!--

## Sizing columns

Columns can either have a **fixed size** or be **flexible** and stretch to accommodate more space - flexible columns use the `flex`/`defaultFlex` properties (inspired by the browser flex-box layout) to specify how the should be stretched in relation to other flexible column.

In addition, columns can have a minimum and/or a maximum width.

```ts
const columns = [
  { field: "firstName", defaultFlex: 2, minWidth: 100 },
  { field: "lastName", defaultFlex: 1 },
  { field: "birthDate", width: 200 },
];
```

In the above example, the `firstName` column will take twice as much space as the `lastName` column.

Suppose the table has `500px` of available space - in this case:

- the `birthDate` column will take `200px` and we have a remaining of `300px`, and a flex total sum of `3`
- `flex: 1` means `100px`
- `flex: 2` will size the column to `200px` - but since we have `minWidth: 100`, it will make sure it will always be at least `100px` in width, even when the available space is not enough

## Controlled and uncontrolled sizing

The InfiniteTable is implemented in `React`, so we have adopted the best-practices in the `React` community - therefore, for most of the table properties and configurations, we provide both a `controlled` and `uncontrolled` version.

The same is applicable for column sizes - if you don't want to write a callback prop that updates the column sizes in response to the user interaction, use the uncontrolled props

- `defaultWidth` - fixed width, but uncontrolled (for controlled version, use `width`)
- `defaultFlex` - flexible size, but uncontrolled (for controlled version, use `flex`)

## Sizing columns - TODO

```tsx
const columnSizing = {
  firstName: {
    flex: 1
  }
}


<InfiniteTable columnSizing={columnSizing} />
``` -->
