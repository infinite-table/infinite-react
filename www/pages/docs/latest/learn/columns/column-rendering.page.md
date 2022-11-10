---
title: Column Rendering
description: Customize column rendering for Infinite Table DataGrid to match your app and use custom components. Column styling and formatting, conditional rendering...
---

Columns render the <PropLink name="columns.field">field</PropLink> value of the data they are bound to. This is the default behavior, which can be customized in a number of ways that we're exploring below.

<Note>

If you want to explicitly use the TypeScript type definition for columns, import the `InfiniteTableColumn` type

```
import { InfiniteTableColumn } from '@infinite-table/infinite-react'
```

Note that it's a generic type, so when you use it, you have to bind it to your `DATA_TYPE` (the type of your data object).
</Note>

<Note>

When using custom rendering or custom components for columns, make sure all your rendering logic is [controlled](https://reactjs.org/docs/forms.html#controlled-components) and that it doesn't have local/transient state.

This is important because `InfiniteTable` uses virtualization heavily, in both _column cells and column headers_, so **custom components can and will be unmounted and re-mounted multiple times**, during the virtualization process (triggered by user scrolling, sorting, filtering and a few other interactions).
</Note>

## Change the value using `valueGetter`

The simplest way to change what's being rendered in a column is to use the `valueGetter` prop and return a new value for the column.

```tsx
const nameColumn: InfiniteTableColumn<Employee> = {
  header: 'Employee Name',
  valueGetter: ({ data }) => `${data.firstName} ${data.lastName}`,
};
```

<Note>

The <PropLink name="columns.valueGetter"/> prop is a function that takes a single argument - an object with `data` and `field` properties.

Note that the <PropLink name="columns.valueGetter"/> is only called for non-group rows, so the `data` property is of type `DATA_TYPE`.

</Note>

<Sandpack title="Column with custom valueGetter">

```tsx file=../../reference/column-valueGetter-example.page.tsx

```

</Sandpack>

<Note>

The column value getter should not return JSX or other markup, because the value return by <PropLink name="columns.valueGetter"/> will be used when the column is sorted (when sorting is done client-side and not remotely). For more in-depth information on sorting see [the column sorting page](./column-sorting).

</Note>

## Use <PropLink name="columns.renderValue">renderValue</PropLink> and <PropLink name="columns.render">render</PropLink> to display custom content

The next step in customizing the rendering for a column is to use the <PropLink name="columns.renderValue" /> or the <PropLink name="columns.render"/> props. In those functions, you have access to more information than in the <PropLink name="columns.valueGetter"/> function. For example, you have access to the current value of `groupBy` and `pivotBy` props.

<PropLink name="columns.renderValue">renderValue</PropLink> and <PropLink name="columns.renderValue">render</PropLink> can return any value that React can render.

The <PropLink name="columns.renderValue">renderValue</PropLink> and <PropLink name="columns.render">render</PropLink> functions are called with an object that has the following properties:

- `data` - the data object (of type `DATA_TYPE | Partial<DATA_TYPE> | null`) for the row.
- `rowInfo` - very useful information about the current row:
  - `rowInfo.collapsed` - if the row is collased or not.
  - `rowInfo.groupBy` - the current group by for the row
  - `rowInfo.indexInAll` - the index of the row in the whole data set
  - `rowInfo.indexInGroup` - the index of the row in the current group
  - `rowInfo.value` - the value (only for group rows) that will be rendered by default in group column cells.
  - ... there are other useful properties that we'll document in the near future
- `column` - the current column being rendered
- `columnsMap` - the `Map` of columns available to the table. Note these might not be all visible. The keys in this map will be column ids.
- `fieldsToColumn` a `Map` that links `DataSource` fields to columns. Columns bound to fields (so with <PropLink name="columns.field" /> specified) will be included in this `Map`.
- `api` - A reference to the [Infinite Table API](/docs/latest/reference/api) object.

<DeepDive title="Column renderValue vs render">

<PropLink name="columns.render"/> is the last function called in the rendering pipeline for a column cell, while <PropLink name="columns.renderValue"/> is called before render, towards the beginning of the [rendering pipeline (read more about this below)](#rendering-pipeline).

Avoid overriding <PropLink name="columns.render"/> for special columns (like group columns) unless you know what you're doing. Special columns use the `render` function to render additional content inside the column (eg: collapse/expand tool for group rows). The <PropLink name="columns.render"/> function allows you to override this additional content. So if you specify this function, it's up to you to render whatever content, including the collapse/expand tool.

However, there are easier ways to override the collapse/expand group icon, like using <PropLink name="columns.renderGroupIcon"/>.

</DeepDive>

<Sandpack title="Column with custom renderValue">

```tsx file=../../reference/column-renderValue-example.page.tsx

```

</Sandpack>

Changing the group icon using `render`. The icon can also be changed using <PropLink name="columns.renderGroupIcon" />.

<Sandpack title="Column with render - custom expand/collapse icon">

<Description>

This snippet shows overriding the group collapse/expand tool via the <PropLink name="columns.render" /> function.

</Description>

```tsx file=../../reference/column-render-example.page.tsx

```

</Sandpack>

<Sandpack title="Column with custom expand/collapse tool via renderGroupIcon">

<Description>

This snippet shows how you can override the group collapse/expand tool via the <PropLink name="columns.renderGroupIcon" /> function.

</Description>

```tsx file=../../reference/column-renderGroupIcon-example.page.tsx

```

</Sandpack>

## Using hooks for custom rendering

Inside the <PropLink name="columns.render" /> and <PropLink name="columns.renderValue" /> functions, you can use hooks - both provided by `InfiniteTable` and any other `React` hooks.

### Hook: <HookLink name="useInfiniteColumnCell"/>

When you're inside a rendering function for a column cell, you can use <HookLink name="useInfiniteColumnCell">useInfiniteColumnCell hook</HookLink> to get access to the current cell's rendering information - the argument passed to the <PropLink name="columns.render">render</PropLink> or <PropLink name="columns.renderValue">renderValue</PropLink> functions.

```tsx
import {
  useInfiniteColumnCell,
  InfiniteTableColumn,
} from '@infinite-table/infintie-react';

function CustomName() {
  const { data, rowInfo } = useInfiniteColumnCell<Employee>();

  return (
    <>
      <b>{data.firstName}</b>, {data.lastName}
    </>
  );
}

const nameColumn: InfiniteTableColumn<Employee> = {
  header: 'Employee Name',
  renderValue: () => <CustomName />,
};
```

<Sandpack title="Column with render & useInfiniteColumnCell">

```tsx file=../../reference/column-render-hooks-example.page.tsx

```

</Sandpack>

### Hook: <HookLink name="useInfiniteHeaderCell" />

For column headers, you can use <HookLink name="useInfiniteHeaderCell" /> hook to get access to the current header's rendering information - the argument passed to the <PropLink name="columns.header"/> function.

```tsx
import {
  useInfiniteHeaderCell,
  InfiniteTableColumn,
} from '@infinite-table/infintie-react';

function CustomHeader() {
  const { column } = useInfiniteHeaderCell<Employee>();

  return <b>{column.field}</b>;
}

const nameColumn: InfiniteTableColumn<Employee> = {
  header: 'Employee Name',
  field: 'firstName',
  header: () => <CustomHeader />,
};
```

<Sandpack title="Column Header with render & useInfiniteHeaderCell">

```tsx file=../../reference/column-header-hooks-example.page.tsx

```

</Sandpack>

## Use <PropLink name="columns.components">column.components</PropLink> to customize the column

There are cases when custom rendering via the <PropLink name="columns.render" /> and <PropLink name="columns.renderValue" /> props is not enough and you want to fully control the column cell and render your own custom component for that.

For such scenarios, you can specify `column.components.HeaderCell` and `column.components.ColumnCell`, which will use those components to render the DOM nodes of the column header and column cells respectively.

```tsx
import { InfiniteTableColumn } from '@infinite-table/infintie-react';

const ColumnCell = (props: React.HTMLProps<HTMLDivElement>) => {
  const { domRef, rowInfo } = useInfiniteColumnCell<Developer>();

  return (
    <div ref={domRef} {...props} style={{ ...props.style, color: 'red' }}>
      {props.children}
    </div>
  );
};

const HeaderCell = (props: React.HTMLProps<HTMLDivElement>) => {
  const { domRef, sortTool } = useInfiniteHeaderCell<Developer>();

  return (
    <div ref={domRef} {...props} style={{ ...props.style, color: 'red' }}>
      {sortTool}
      First name
    </div>
  );
};

const nameColumn: InfiniteTableColumn<Developer> = {
  header: 'Name',
  field: 'firstName',
  components: {
    ColumnCell,
    HeaderCell,
  },
};
```

<Note>

When using custom components, make sure you get `domRef` from the corresponding hook (<HookLink name="useInfiniteColumnCell" /> for column cells and <HookLink name="useInfiniteHeaderCell" /> for header cells) and pass it on to the final `JSX.Element` that is the DOM root of the component.

```tsx
// inside a component specified in column.components.ColumnCell
const { domRef } = useInfiniteColumnCell<DATA_TYPE>();

return <div ref={domRef}>...</div>;
```

Also you have to make sure you spread all other `props` you receive in the component, as they are `HTMLProps` that need to end-up in the DOM (eg: `className` for theming and default styles, etc).

Both <PropLink name="columns.components.ColumnCell">components.ColumnCell</PropLink> and <PropLink name="columns.components.HeaderCell">components.HeaderCell</PropLink> need to be declared with `props` being of type `HTMLProps<HTMLDivElement>`.

</Note>

<Sandpack title="Custom components">

```tsx file=../../reference/column-components-example.page.tsx

```

</Sandpack>

<Note>

If you're using the <HookLink name="useInfiniteColumnCell" /> hook inside the <PropLink name="columns.render" /> or <PropLink name="columns.renderValue" /> functions (and not as part of a custom component in <PropLink name="columns.components.ColumnCell" />), you don't need to pass on the `domRef` to the root of the DOM you're rendering (same is true if you're using <HookLink name="useInfiniteHeaderCell" /> inside the <PropLink name="columns.header" /> function).

</Note>

If the above <PropLink name="columns.components" /> is still not enough, read about the rendering pipeline below.

## Rendering pipeline

The rendering pipeline for columns is a series of functions defined on the column that are called while rendering.

<Note>

All the functions that have the word `render` in their name will be called with an object that has a `renderBag` property, which contains values that will be rendered.

</Note>

The default <PropLink name="columns.render" /> function (the last one in the pipeline) ends up rendering a few things:

- a `value` - generally comes from the <PropLink name="columns.field">field</PropLink> the column is bound to
- a `groupIcon` - for group columns
- a `selectionCheckBox` - for columns that have <PropLink name="columns.renderSelectionCheckBox" /> defined (combined with row selection)
<!-- * a `menuIcon` - for all columns by default, unless they have <PropLink name="columns.renderMenuIcon">renderMenuIcon=false</PropLink> - this is the icon that opens the column menu -->

When the rendering process starts for a column cell, all the above end up in the `renderBag` object.

### Rendering pipeline - `renderBag.value`

As already mentioned, the `value` defaults to the value of the column <PropLink name="columns.field">field</PropLink> for the current row.

If the column is not bound to a field, you can define a <PropLink name="columns.valueGetter">valueGetter</PropLink>. The <PropLink name="columns.valueGetter">valueGetter</PropLink> only has access to `{data, field?}` in order to compute a value and return it.

After the <PropLink name="columns.valueGetter">valueGetter</PropLink> is called, the <PropLink name="columns.valueFormatter">valueFormatter</PropLink> is next in the rendering pipeline.

This is called with more details about the current cell

```tsx
const column: InfiniteTableColumn<T> = {
  // the valueGetter can be useful when rows are nested objects
  // or you want to compose multiple values from the row
  valueGetter: ({ data }) => {
    return data.person.salary * 10;
  },
  valueFormatter: ({
    value,
    isGroupRow,
    data,
    field,
    rowInfo,
    rowSelected,
    rowActive,
  }) => {
    // the value here is what the `valueFormatter` returned
    return `USD ${value}`;
  },
};
```

After <PropLink name="columns.valueGetter">valueGetter</PropLink> and <PropLink name="columns.valueFormatter">valueFormatter</PropLink> are called, the resulting value is the actual value used for the cell. This value will also be assigned to `renderBag.value`

When <PropLink name="columns.renderValue">renderValue</PropLink> and <PropLink name="columns.render">render</PropLink> are called by `InfiniteTable`, both `value` and `renderBag` will be available as properties to the arguments object.

```tsx {3,12}
const column: InfiniteTableColumn<T> = {
  valueGetter: () => 'world',
  renderValue: ({ value, renderBag, rowInfo }) => {
    // at this stage, `value` is 'world' and `renderBag.value` has the same value, 'world'
    return <b>{value}</b>;
  },

  render: ({ value, renderBag, rowInfo }) => {
    // at this stage `value` is 'world'
    // but `renderBag.value` is <b>world</b>, as this was the value returned by `renderValue`
    return <div>Hello {renderBag.value}!</div>;
  },
};
```

<Note>

After the <PropLink name="columns.renderValue">renderValue</PropLink> function is called, the following are also called (if available):

- <PropLink name="columns.renderGroupValue">renderGroupValue</PropLink> - for group rows
- <PropLink name="columns.renderLeafValue">renderLeafValue</PropLink> - for leaf rows

You can think of them as an equivalent to <PropLink name="columns.renderValue">renderValue</PropLink>, but narrowed down to group/non-group rows.

Inside those functions, the `renderBag.value` refers to the value returned by the <PropLink name="columns.renderValue">renderValue</PropLink> function.

</Note>

### Rendering pipeline - `renderBag.groupIcon`

In a similar way to `renderBag.value`, the `renderBag.groupIcon` is also piped through to the <PropLink name="columns.render">render</PropLink> function.

```tsx {2,9}
const column: InfiniteTableColumn<T> = {
  renderGroupIcon: ({ renderBag, toggleGroupRow }) => {
    return <> [ {renderBag.groupIcon} ] </>;
  },
  render: ({ renderBag }) => {
    return (
      <>
        {/* use the groupIcon from the renderBag */}
        {renderBag.groupIcon}
        {renderBag.value}
      </>
    );
  },
};
```

<Hint>

Inside <PropLink name="columns.renderGroupIcon" />, you have access to `renderBag.groupIcon`, which is basically the default group icon - so you can use that if you want, and build on that.

Also inside <PropLink name="columns.renderGroupIcon" />, you have access to `toggleGroupRow` so you can properly hook the collapse/expand behaviour to your custom group icon.

</Hint>

<!-- ### Rendering pipeline - `renderBag.sortIcon`

Similarly to `renderBag.value`, the `renderBag.sortIcon` is also piped through to the <PropLink name="columns.render">render</PropLink> function.

```tsx {2,10}
const column: InfiniteTableColumn<T> = {
  renderSortIcon: ({ renderBag, column }) => {
    // you can use the column to get the sort direction
    return <> [ {renderBag.sortIcon} ] </>
  },
  render: ({  renderBag })=> {

    return <>

      {renderBag.sortIcon}
      {renderBag.menuIcon}
      {renderBag.value}
    </>
  }
}
```

<Hint>

Inside <PropLink name="columns.renderSortIcon" />, you have access to `renderBag.sortIcon`, which is basically the default sort icon - so you can use that if you want, and build on that.

Also inside <PropLink name="columns.renderSortIcon" />, you have access to the current `column` so you can know what sorting is currently applied to the column.

</Hint> -->

### Rendering pipeline - `renderBag.selectionCheckBox`

Like with the previous properties of `renderBag`, you can customize the `selectionCheckBox` (used when multiple selection is configured) to be piped-through - for columns that specify <PropLink name="columns.renderSelectionCheckBox" />.

```tsx {2,25}
const column: InfiniteTableColumn<T> = {
  renderSelectionCheckBox: ({
    renderBag,
    rowSelected,
    isGroupRow,
    toggleCurrentRowSelection,
    toggleCurrentGroupRowSelection,
  }) => {
    const toggle = isGroupRow
      ? toggleCurrentGroupRowSelection
      : toggleCurrentRowSelection;

    // you could return renderBag.groupIcon to have the default icon

    const selection =
      rowSelected === null
        ? '-' // we're in a group row with indeterminate state if rowSelected === null
        : rowSelected
        ? 'x'
        : 'o';

    return <div onClick={toggle}> [ {selection} ] </div>;
  },
  render: ({ renderBag }) => {
    return (
      <>
        {/* use the selectionCheckBox from the renderBag */}
        {renderBag.selectionCheckBox}
        {renderBag.groupIcon}
        {renderBag.value}
      </>
    );
  },
};
```

<!-- ### Rendering pipeline - `renderBag.menuIcon`

Similarly to the previous properties of `renderBag`, you can customize the `menuIcon` for a column (when clicked, it shows the column menu) to be piped-through - for columns that specify <PropLink name="columns.renderMenuIcon" />.


```tsx {2,16}
const column: InfiniteTableColumn<T> = {
  renderMenuIcon: ({
    renderBag,
    column,
    columnsMap
  }) => {
    if (column.type === 'number') {
      return false
    }

    return renderBag.menuIcon
  },
  render: ({  renderBag })=> {
    return <>

      {renderBag.menuIcon}
      {renderBag.selectionCheckBox}
      {renderBag.sortIcon}
      {renderBag.value}
    </>
  }
}
```


<Hint>

Inside <PropLink name="columns.renderMenuIcon" />, you have access to `renderBag.menuIcon`, which is basically the default menu icon - so you can use that if you want or you can customize it.

Also inside <PropLink name="columns.renderMenuIcon" />, you have access to the current `column` and all the information you need about it.

</Hint> -->

To recap, here is the full list of the functions in the rendering pipeline, in order of invocation:

1.<PropLink name="columns.valueGetter" /> - doesn't have access to `renderBag` 2.<PropLink name="columns.valueFormatter" /> - doesn't have access to `renderBag`

3.<PropLink name="columns.renderGroupIcon" /> - can use all properties in `renderBag` 4.<PropLink name="columns.renderSelectionCheckBox" /> - can use all properties in `renderBag`

<!-- 5.<PropLink name="columns.renderMenuIcon" /> - can use all properties in `renderBag`
6.<PropLink name="columns.renderSortIcon" /> - can use all properties in `renderBag` -->

5.<PropLink name="columns.renderValue" /> - can use all properties in `renderBag` 6.<PropLink name="columns.renderGroupValue" /> - can use all properties in `renderBag`

7.<PropLink name="columns.renderLeafValue" /> - can use all properties in `renderBag` 8.<PropLink name="columns.render" /> - can use all properties in `renderBag`

Additionally, the <PropLink name="columns.components.ColumnCell" /> custom component does have access to the `renderBag` via <HookLink name="useInfiniteColumnCell" />
