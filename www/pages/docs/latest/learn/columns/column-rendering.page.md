---
title: Column Rendering
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

This is important because `InfiniteTable` uses virtualization heavily, in both *column cells and column headers*, so **custom components can and will be unmounted and re-mounted multiple times**, during the virtualization process (triggered by user scrolling, sorting, filtering and a few other interactions).
</Note>

## Change the value using `valueGetter`

The simplest way to change what's being rendered in a column is to use the `valueGetter` prop and return a new value for the column.

```tsx
const nameColumn: InfiniteTableColumn<Employee> = {
  header: 'Employee Name',
  valueGetter: ({ data }) =>
    `${data.firstName} ${data.lastName}`,
};
```

<Note>

The <PropLink name="columns.valueGetter"/> prop is a function that takes a single argument - an object with `data` and `rowInfo` properties.

Note that the `data` property is of type `DATA_TYPE | Partial<DATA_TYPE> | null` and not simply `DATA_TYPE`, because there are cases when you can have grouping (so for group rows with aggregations `data` will be `Partial<DATA_TYPE>`) or when there are lazily loaded rows or group rows with no aggregations - for which `data` is still `null`.

</Note>

<Sandpack title="Column with custom valueGetter">

```tsx file=../../reference/column-valueGetter-example.page.tsx

```

</Sandpack>

<Note>

<PropLink name="columns.valueGetter"/>

</Note>

## Use <PropLink name="columns.renderValue">renderValue</PropLink> and <PropLink name="columns.render">render</PropLink> to display custom content

The next step in customizing the column is to use the <PropLink name="columns.renderValue" /> or the <PropLink name="columns.render"/> props. In those functions, you have access to more information than in the <PropLink name="columns.valueGetter"/> function. For example, you have access to the current value of `groupBy` and `pivotBy` props.

<PropLink name="columns.renderValue">renderValue</PropLink> and <PropLink name="columns.renderValue">render</PropLink> can return any value that React can render.

The <PropLink name="columns.renderValue">renderValue</PropLink> and <PropLink name="columns.render">render</PropLink> functions are called with an object that has the following properties:

- data - the data object (of type `DATA_TYPE | Partial<DATA_TYPE> | null`) for the row.
- rowInfo - very useful information about the current row:
  - `rowInfo.value` - the value that will be rendered by default
  - `rowInfo.collapsed` - if the row is collased or not.
  - `rowInfo.groupBy` - the current group by for the row
  - `rowInfo.indexInAll` - the index of the row in the whole data set
  - `rowInfo.indexInGroup` - the index of the row in the current group
  - ... there are other useful properties that we'll document in the near future

<Note>

The difference between <PropLink name="columns.renderValue"/> and <PropLink name="columns.render"/> is only for special columns (for now, only group columns are special columns, but more will come) when `InfiniteTable` renders additional content inside the column (eg: collapse/expand tool for group rows). The <PropLink name="columns.render"/> function allows you to override the additional content. So if you specify this function, it's up to you to render whatever content, including the collapse/expand tool.

Note that for customizing the collapse/expand tool, you can use specify `renderGroupIcon` function on the group column.

</Note>

<Sandpack title="Column with custom renderValue">

```tsx file=../../reference/column-renderValue-example.page.tsx

```

</Sandpack>

Changing the group icon using `render`. The icon can also be changed using `renderGroupIcon`.

<Sandpack title="Column with render - custom expand/collapse icon">

```tsx file=../../reference/column-render-example.page.tsx

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
  const { data, rowInfo } =
    useInfiniteColumnCell<Employee>();

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

const ColumnCell = (
  props: React.HTMLProps<HTMLDivElement>
) => {
  const { domRef, rowInfo } =
    useInfiniteColumnCell<Developer>();

  return (
    <div
      ref={domRef}
      {...props}
      style={{ ...props.style, color: 'red' }}>
      {props.children}
    </div>
  );
};

const HeaderCell = (
  props: React.HTMLProps<HTMLDivElement>
) => {
  const { domRef, sortTool } =
    useInfiniteHeaderCell<Developer>();

  return (
    <div
      ref={domRef}
      {...props}
      style={{ ...props.style, color: 'red' }}>
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

return <div ref={domRef}>
   ...
</div>
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
