---
title: Infinite Table Hooks
layout: API
description: Hooks Reference page for Infinite Table - with complete examples
---

Infinite Table exposes a few custom hooks that can be used to customize the component and its behavior. Most of the hooks will be useful when you want to implement custom components for `InfiniteTable` - like custom cells, headers, cell editors, etc.

See below for the full list of hooks exposed by `InfiniteTable`, each with examples and code snippets.

<PropTable sort searchPlaceholder="Type to filter hooks">

<Prop name="useMasterRowInfo" returnTypeLink="InfiniteTableRowInfo">

> Gives you access to the master row info in the current <PropLink name="components.RowDetail" code={false} >RowDetail</PropLink> component.


<Sandpack>

<Description>
This example shows a master DataGrid with cities & countries.

The details for each city shows a DataGrid with developers in that city.
</Description>

```ts file="$DOCS/learn/master-detail/master-detail-component-example.page.tsx" title="Basic master detail DataGrid example" size="lg"

```
</Sandpack>
</Prop>

<Prop name="useDataSourceState"  type="(selector: (DataSourceState) => any)">

> You can use it in your app components that are nested inside the `<DataSource />`

```ts
import { useDataSourceState } from '@infinite-table/infinite-react'
```

Using it gives you access to the underlying data that InfiniteTable is using.

<Note>

Call this hook with a `selector` function, which accepts the current `DataSourceState` as the first parameter.

```ts title="Example usage - selecting the length of the data array"

const length = useDataSourceState(state => state.dataArray.length)

```

</Note>

<Note>

Please make sure you know what you're doing. This is intended only for advanced and complex use-cases.

</Note>


```tsx title="InfiniteTable can be nested anywhere inside the <DataSource /> component"
<DataSource>
  <h1>Your DataGrid>
  <App>
    <InfiniteTable />
  </App>
</DataSource>
```

Any component nested inside the `<DataSource />` can access the underlying data.

```tsx live file="using-datasource-context.page.tsx"

```
</Prop>

<Prop name="useInfiniteColumnCell" returnTypeLink="InfiniteColumnEditorContextType">

> Use it inside the <PropLink name="columns.render" /> or <PropLink name="column.components.ColumnCell" /> (or <PropLink name="columns.renderValue" code={false}>other</PropLink> rendering functions) to retrieve information about the cell that is being rendered.

```ts
import { useInfiniteColumnCell } from '@infinite-table/infinite-react';
```

For custom column header components, see related <HookLink name="useInfiniteHeaderCell" />.

When using this hook inside a <PropLink name="columns.components.ColumnCell" code={false}>custom column cell component</PropLink>, make sure you get `domRef` from the hook result and pass it on to the final `JSX.Element` that is the DOM root of the component.

```tsx
const CustomCellComponent = (props: React.HTMLProps<HTMLDivElement>) => {
  const { domRef, ...other } = useInfiniteColumnCell<Developer>();

  return (
    <div ref={domRef} {...props} style={{ ...props.style, color: 'red' }}>
      {props.children}
    </div>
  );
};
```

You should not pass the `domRef` along when using the hook inside the <PropLink name="columns.render" /> or <PropLink name="columns.renderValue" /> function.

<Sandpack title="Column with render & useInfiniteColumnCell">

```tsx file="$DOCS/reference/column-render-hooks-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="useInfiniteColumnEditor" >

> Allows you to write a custom editor to be used for [editing](/docs/learn/editing/overview). The hook returns an <TypeLink name="InfiniteColumnEditorContextType" /> object shape.

Inside this hook, you can also call <HookLink name="useInfiniteColumnCell" /> to get access to the cell-related information.

See related <PropLink name="columns.components.Editor" />

<Note>

When writing a custom editor, it's probably good to stop the propagation of the `KeyDown` event, so that the table doesn't react to the key presses (and do navigation and other stuff).

</Note>

<Sandpack title="Column with custom editor">

<Description>

Try editing the `salary` column - it has a custom editor

</Description>

```tsx file="custom-editor-hooks-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="useInfiniteColumnFilterEditor" type="() => ({ column, value, setValue, className, filtered,... })">

> Used to write custom filter editors for columns.

The return value of this hook is an object with the following properties:

- `value` - the value that should be passed to the filter editor
- `setValue(value)` - the functon you have to call to update the filtering for the current column
- `column` - the current column
- `operatorName`: `string` - the name of the operator currently being applied
- `className` - a CSS class name to apply to the filter editor, for default styling
- `filtered` - a boolean indicating whether the column is currently filtered or not
- `disabled` - a boolean indicating whether the filter editor should be rendered as disabled or not
- `filterTypeKey`: `string` - the key of the filter type
- `filterType` - the filter type object for the current column
- `filterTypes` - a reference to the <DPropLink name="filterTypes" /> object as configured in the `DataSource`

<Sandpack title="Demo of a custom filter editor">

<Description>

The `canDesign` column is using a custom `bool` filter type with a custom filter editor.

The checkbox has indeterminate state, which will match all values in the data source.

</Description>

```ts file="custom-filter-editor-hooks-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="useInfiniteHeaderCell" >

> Used inside <PropLink name="columns.header" /> or <PropLink name="column.components.HeaderCell" />

```ts
import { useInfiniteHeaderCell } from '@infinite-table/infinite-react';
```

For custom column cell components, see related <HookLink name="useInfiniteColumnCell" />.

When using this hook inside a <PropLink name="columns.components.HeaderCell" code={false}>custom column header component</PropLink>, make sure you get `domRef` from the hook result and pass it on to the final `JSX.Element` that is the DOM root of the component.

```tsx
const CustomHeaderComponent = (props: React.HTMLProps<HTMLDivElement>) => {
  const { domRef, ...other } = useInfiniteHeaderCell<Developer>();

  return (
    <div ref={domRef} {...props} style={{ ...props.style, color: 'red' }}>
      {props.children}
    </div>
  );
};
```

You should not pass the `domRef` along when using the hook inside the
<PropLink name="columns.header" /> function.

<Sandpack title="Column with custom header & useInfiniteHeaderCell">

```tsx file="$DOCS/reference/column-header-hooks-example.page.tsx"

```

</Sandpack>

</Prop>

</PropTable>
