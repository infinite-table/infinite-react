---
title: Column Headers
description: Configure column headers with custom column header, custom sort icon, menu icon and more.
---

Column headers have the same level of customization as column cells - you can fully control what is being rendered and when. Here's a summary of the things you can do in the column header:

- customize the header label of a column
- specify custom sort icon
- configure and customize the menu icon
- configure the column selection chechbox (for columns configured to display a selection checkbox)
- customize the order of all of the above, and select which ones should be included

## Column Header Label

By default, the label displayed for the column header is the <PropLink name="columns.field">field</PropLink> the column is bound to. If you want to customize this, use the <PropLink name="columns.header">header</PropLink> property.

```tsx
type Developer = {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
}
const columns: InfiniteTablePropColumns<Developer> = {
  id: {
    field: 'id', // will be used as default label in column header
    defaultWidth: 100,
  },
  name: {
    header: 'First and Last Name', // custom column header label
    valueGetter: ({ data }) => `${data.firstName} ${data.lastName}`,
  }
}
```

<Sandpack title="Simple table with both default and custom column headers">

```ts file=column-header-example.page.tsx
```

</Sandpack>

Having the <PropLink name="columns.header">header</PropLink> property be a strin value is useful but when you want more flexibility, you can use a function instead.

When <PropLink name="columns.header" code={false}>the column header</PropLink> is a function, it is called with an object that contains the following properties:

- `column` - the current column object. NOTE: it's not the same as the column object you passed to the <PropLink name="columns">columns</PropLink> prop - but rather an enhanced version of that, which contains additional properties and computed values. It is called a "computed" column - typed as `InfiniteTableComputedColumn<DATA_TYPE>`.
- `columnsMap` - a map of all computed columns available in the table, keyed by the column id. This is useful if at runtime you need access to other columns in the table. NOTE: this map does not contain only the visible columns, but rather ALL the columns.
- `columnSortInfo` - the sorting information for the current column, or `null` if the column is not sorted.
- `api` - a reference to the table [API](/docs/reference/api) object.
- `columnApi` - a reference to the table [Column API](/docs/reference/column-api) object for bound to the current column.
- `allRowsSelected: boolean`
- `someRowsSelected: boolean`
- `renderBag` - more on that below - used to reference changes between the different render functions of the column header (those functions are the column header rendering pipeline described in the next section).

<Note>

All the render props exposed for the rendering pipeline of the column header are called with the same object as the first argument.

</Note>

Having the <PropLink name="column.header" code={false}>column header</PropLink> as a function and having access to the state of the column and of the table allows you to create very dynamic column headers that accurately reflect column state.

## Column Header Rendering Pipeline

The rendering pipeline of the column header is similar to the one of the column cells.

It's a series of functions defined on the column that are called while rendering elements found in the column header (the header label, the sort and menu icons, the selection checkbox).

All of the functions that are part of the column header rendering pipeline are called with the same object as the first argument - the shape of this object is described in the previous section.

### Customizing the Sort Icon

### Customizing the Menu Icon

### Customizing the Selection Checkbox

### Putting It All Together
