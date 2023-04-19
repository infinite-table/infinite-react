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

```ts file="column-header-example.page.tsx"
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

It's a series of functions defined on the column that are called while rendering elements found in the column header (the header label, the sort and menu icons, the filtering icon, the selection checkbox).

All of the functions that are part of the column header rendering pipeline are called with the same object as the first argument - the shape of this object is described in the previous section.

 * <PropLink name="columns.renderSortIcon">renderSortIcon</PropLink>
 * <PropLink name="columns.renderFilterIcon">renderFilterIcon</PropLink>
 * <PropLink name="columns.renderMenuIcon">renderMenuIcon</PropLink>
 * <PropLink name="columns.renderSelectionCheckBox">renderSelectionCheckBox</PropLink>
 * <PropLink name="columns.renderHeaderSelectionCheckBox">renderHeaderSelectionCheckBox</PropLink>
 * <PropLink name="columns.header">header</PropLink>

If you want to customize any of the above, use the corresponding function.

For even more control, the last function in the pipeline that gets called is the <PropLink name="columns.renderHeader">column.renderHeader</PropLink> function.

This function is called with the same object as the first argument, but it also has a `renderBag` property that contains the result of all the previous functions in the pipeline (eg: `renderBag.sortIcon` - the result of the <PropLink name="columns.renderSortIcon">renderSortIcon</PropLink> call, `renderBag.filterIcon` - the result of the <PropLink name="columns.renderFilterIcon">renderFilterIcon</PropLink> call, etc).

So if you specify a custom <PropLink name="columns.renderHeader">renderHeader</PropLink> function, it's up to you to use the results of the previous functions in the pipeline, in order to fully take control of the column header.

### Customizing the Sort Icon

For customizing the sort icon, use the <PropLink name="columns.renderSortIcon">column.renderSortIcon</PropLink> function.

Inside that function you can either use the object passed as a parameter to get information about the sort state of the column

```tsx {1} title="Customizing_the_column_sort_icon"
renderSortIcon({ columnSortInfo }) {
  if (!columnSortInfo) {
    return ' 🤷‍♂️';
  }
  return columnSortInfo.dir === 1 ? '▲' : '▼';
}
```

or you can use the <HookLink name="useInfiniteHeaderCell"/> hook to get the same information.

```tsx {8} title="Customizing_the_column_sort_icon"
import {
  useInfiniteHeaderCell,
} from '@infinite-table/infinite-react';

/// ...

renderSortIcon(){
  const { columnSortInfo } = useInfiniteHeaderCell();
  if (!columnSortInfo) {
    return ' 🤷‍♂️';
  }
  return columnSortInfo.dir === 1 ? '▲' : '▼';
},
```

<Sandpack title="Custom sort icon for the name column">

```ts file="column-sort-icon-example.page.tsx"
```

</Sandpack>


### Customizing the Menu Icon


For customizing the menu icon, use the <PropLink name="columns.renderMenuIcon">column.renderMenuIcon</PropLink> function.

Inside that function you can either use the object passed as a parameter to get information about the column

```tsx {1} title="Customizing_the_menu_icon"
renderMenuIcon({ column }) {
  return `🔧 ${column.id}`;
}
```

or you can use the <HookLink name="useInfiniteHeaderCell"/> hook to get the same information.

```tsx {8} title="Customizing_the_menu_icon"
import {
  useInfiniteHeaderCell,
} from '@infinite-table/infinite-react';

/// ...

renderMenuIcon(){
  const { column } = useInfiniteHeaderCell();
  return `🔧 ${column.id}`;
},
```

<Sandpack title="Custom menu icon for the name and age columns">

<Description>

Hover over the header for the `Name` and `Age` columns to see the custom menu icon.

Also, the id column has `renderMenuIcon: false` set, so it doesn't show a column menu at all.

</Description>

```ts file="column-menu-icon-example.page.tsx"
```

</Sandpack>

<Note>

If you don't want to show a column menu (icon) at all, you can set the <PropLink name="columns.renderMenuIcon">column.renderMenuIcon</PropLink> prop to `false`.

Also, see the <PropLink name="columns.renderMenuIcon">column.renderMenuIcon</PropLink> docs for an example on how to use the api to open the column menu.

</Note>


### Customizing the Filter Icon


For customizing the filter icon, use the <PropLink name="columns.renderFilterIcon">column.renderFilterIcon</PropLink> function.

Inside that function you can either use the object passed as a parameter to get information about the `filtered` state of the column

```tsx {1} title="Customizing_the_filter_icon"
renderFilterIcon({ filtered }) {
  return filtered ? '🔍' : '';
}
```

or you can use the <HookLink name="useInfiniteHeaderCell"/> hook to get the same information.

```tsx {8} title="Customizing_the_menu_icon"
import {
  useInfiniteHeaderCell,
} from '@infinite-table/infinite-react';

/// ...

renderMenuIcon(){
  const { filtered } = useInfiniteHeaderCell();
  return filtered ? '🔥' : '';
},
```

In addition, you can use the `filtered` property in the <PropLink name="columns.header">column.header</PropLink> function to determine if the column is filtered or not and render a different header label.

<Note>

If specified, the <PropLink name="columns.renderFilterIcon">column.renderFilterIcon</PropLink> function prop is called even if the column is not currently filtered.

</Note>

<Sandpack title="Custom filter icons for salary and name columns">

<Description>

The `salary` column will show a bolded label when filtered.

The `firstName` column will show a custom filter icon when filtered.

</Description>

```ts file="column-filter-icon-example.page.tsx"
```

</Sandpack>

### Customizing the Selection Checkbox


For customizing the selection checkbox in the column header, use the <PropLink name="columns.renderHeaderSelectionCheckBox">column.renderHeaderSelectionCheckBox</PropLink> function.

<Note>

If you want another column, other than the group column, to show a selection checkbox, you have to also set the <PropLink name="columns.renderSelectionCheckBox">column.renderSelectionCheckBox</PropLink> prop to `true`.

</Note>

<Sandpack title="Custom header checkbox selection for columns">

<Description>

The group column, as well as the `stack` column display a custom selection checkbox in the column header.

</Description>

```ts file="column-header-selection-checkbox-example.page.tsx"
```

</Sandpack>