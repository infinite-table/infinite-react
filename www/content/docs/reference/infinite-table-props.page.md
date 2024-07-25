---
title: Infinite Table Props
layout: API
description: Infinite Table Props Reference page with complete examples
---

In the API Reference below we'll use **`DATA_TYPE`** to refer to the TypeScript type that represents the data the component is bound to.

<PropTable sort>

<Prop name="components.RowDetail">

> Component to use for rendering the row details section in the master-detail DataGrid. When specified, it makes InfiniteTable be a [master-detail DataGrid](/docs/learn/master-detail/overview). For configuring the height of row details, see <PropLink name="rowDetailHeight" />

See related <PropLink name="rowDetailRenderer" />.

<Sandpack title="Basic master detail DataGrid example" size="lg">

<Description>

This example shows a master DataGrid with cities & countries.

The details for each city shows a DataGrid with developers in that city.

</Description>

```ts file="$DOCS/learn/master-detail/master-detail-component-example.page.tsx"

```

</Sandpack>


</Prop>

<Prop name="scrollStopDelay" type="number" defaultValue={250}>

> The delay in milliseconds that the DataGrid waits until it considers scrolling to be stopped. Also used when lazy loading is to fetch the next batch of data.

This also determines when the <PropLink name="onScrollStop" /> callback prop is called.

<Sandpack title="Scroll stop delay for lazy loading">

```ts file="scrollStopDelay-lazy-load-example.page.tsx"

```

</Sandpack>

</Prop>



<Prop name="headerOptions" type="{alwaysReserveSpaceForSortIcon: boolean}" >

> Various header configurations for the DataGrid.

For now, it has the following properties:

 - <PropLink name="headerOptions.alwaysReserveSpaceForSortIcon" />

<Sandpack>

```tsx file="sortIcon-reserve-space-example.page.tsx"
```
</Sandpack>

</Prop>

<Prop name="headerOptions.alwaysReserveSpaceForSortIcon" type="boolean" defaultValue={true}>

> Whether to reserve space in the column header for the sort icon or not.

When this is set to `true`, the space for the sort icon is always reserved, even if the column is not currently sorted.

<Sandpack>

```tsx file="sortIcon-reserve-space-example.page.tsx"
```
</Sandpack>

</Prop>

<Prop name="rowDetailRenderer" type="(rowInfo: InfiniteTableRowInfo<DATA_TYPE>) => ReactNode">

> When specified, it makes InfiniteTable be a [master-detail DataGrid](/docs/learn/master-detail/overview). For configuring the height of row details, see <PropLink name="rowDetailHeight" />. See related <PropLink name="components.RowDetail" />.

It's an alternative to using <PropLink name="components.RowDetail" />.

This function is called with the <TypeLink name="InfiniteTableRowInfo">rowInfo</TypeLink> the user expands to see details for.

Using this function, you can render another DataGrid or any other custom content.

<Note>

Make sure you have a column with the `renderRowDetailIcon: true` flag set. <PropLink name="columns.renderRowDetailIcon" /> on a column makes the column display the row details expand icon.

Without this flag, no column will have the expand icon, and the master-detail functionality will not work.

</Note>

To configure the height of the row details section, use the <PropLink name="rowDetailHeight" /> prop.

For rendering some row details as already expanded, see <PropLink name="defaultRowDetailState" />.

<Sandpack title="Basic master detail DataGrid example" size="lg">

<Description>

This example shows a master DataGrid with cities & countries.

The details for each city shows a DataGrid with developers in that city.

</Description>

```ts file="$DOCS/learn/master-detail/master-detail-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="defaultRowDetailState" type="RowDetailState">

> Specifies the default expanded/collapsed state of row details.

For the controlled version, see <PropLink name="rowDetailState" />.

If <PropLink name="isRowDetailExpanded" /> is specified, it has the last word in deciding if a row detail is expanded or not, so it overrides the `defaultRowDetailState`.

<Sandpack title="Master detail DataGrid with some row details expanded by default" size="lg">

<Description>

Some of the rows in the master DataGrid are expanded by default.

</Description>

```ts file="$DOCS/learn/master-detail/master-detail-default-expanded-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="isRowDetailExpanded" type="(rowInfo: InfiniteTableRowInfo) => boolean">

> This function ultimately decides if a row detail is expanded or not.

This function is meant for very advanced scenarios. For common use-cases, you'll probably use <PropLink name="rowDetailState" /> and <PropLink name="defaultRowDetailState" />.

If `isRowDetailExpanded` is specified, it overrides <PropLink name="rowDetailState" />/<PropLink name="defaultRowDetailState" />.

</Prop>

<Prop name="isRowDetailEnabled" type="(rowInfo: InfiniteTableRowInfo<DATA_TYPE>) => boolean">

> Decides on a per-row basis if the row details are enabled or not. See [Master Detail](/docs/learn/master-detail/overview) for more information.

This function is called with the <TypeLink name="InfiniteTableRowInfo">rowInfo</TypeLink> and should return a `boolean` value.


It's useful when you don't want to show the row detail for some rows.

<Sandpack title="Master detail DataGrid with some row not having details" size="lg">

<Description>

All the odd rows don't have details.

</Description>

```ts file="$DOCS/learn/master-detail/master-detail-per-row-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="rowDetailState" type="RowDetailState">

> Specifies the expanded/collapsed state of row details.

For the uncontrolled version, see <PropLink name="defaultRowDetailState" />.

When you use this controlled property, make sure you pair it with the <PropLink name="onRowDetailStateChange" /> callback to update it.

If <PropLink name="isRowDetailExpanded" /> is specified, it has the final say in deciding if a row detail is expanded or not, so it overrides the `rowDetailState` and <PropLink name="defaultRowDetailState" />.

<Sandpack title="Master detail DataGrid with some row details expanded by default" size="lg">

<Description>

Some of the rows in the master DataGrid are expanded by default.

</Description>

```ts file="$DOCS/learn/master-detail/master-detail-controlled-expanded-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="onRowDetailStateChange" type="(rowDetailState: RowDetailState, {expandRow, collapseRow}) => void">

> Called when the expand/collapse state of row details changes.

You can use this function prop to update the <PropLink name="rowDetailState" /> prop or simply to listen to changes in the row details state.

<Note>

This function is called with an instance of the <TypeLink name="RowDetailState" />. If you want to get the object behind it, simply call `rowDetailState.getState()`.

Both the `RowDetailState` instance and the state object (literal) are valid values you can pass to the <PropLink name="rowDetailState" />.

</Note>

<Note>

The second parameter of this function is an object with `expandRow` and `collapseRow` properties, which contain the primary key of either the last expanded or the last collapsed row.

For example, if the user is expanding row `3`, the object will be `{expandRow: 3, collapseRow: null}`.
Next, if the user collapses row `5`, the object will be `{expandRow: null, collapseRow: 5}`.

This makes it easy for you to know which action was taken and on which row.

</Note>

See related <PropLink name="rowDetailState" /> and <PropLink name="defaultRowDetailState" />.

<Sandpack title="Master detail DataGrid with listener to the row expand/collapse state change" size="lg">

<Description>

Some of the rows in the master DataGrid are expanded by default.

</Description>

```ts file="$DOCS/learn/master-detail/master-detail-controlled-expanded-example.page.tsx"

```

</Sandpack>
</Prop>

<Prop name="rowDetailCache" type="boolean|number">
> Controls the caching of detail DataGrids. By default, caching is disabled.

It can be one of the following:

- `false` - caching is disabled - this is the default
- `true` - enables caching for all detail DataGrids
- `number` - the maximum number of detail DataGrids to keep in the cache. When the limit is reached, the oldest detail DataGrid will be removed from the cache.

<Sandpack title="Master detail DataGrid with caching for 5 detail DataGrids" size="lg" viewMode="preview">

<Description>

This example will cache the last 5 detail DataGrids - meaning they won't reload when you expand them again.
You can try collapsing a row and then expanding it again to see the caching in action - it won't reload the data.
But when you open up a row that hasn't been opened before, it will load the data from the remote location.

</Description>

```ts file="$DOCS/learn/master-detail/master-detail-caching-with-default-expanded-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="rowDetailHeight" type="number|CSSVar|(rowInfo)=>number" defaultValue={300}>

> Controls the height of the row details section, in master-detail DataGrids.

The default value is `300` pixels.

This can be a number, a string (the name of a CSS variable - eg `--detail-height`), or a function. When a function is defined, it's called with the <TypeLink name="InfiniteTableRowInfo">rowInfo</TypeLink> object for the corresponding row.

<Sandpack title="Master detail DataGrid with custom detail height" size="lg">

<Description>

In this example we configure the height of row details to be 200px.

</Description>

```ts file="$DOCS/learn/master-detail/master-detail-custom-detail-height-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="activeCellIndex" type="[number,number] | null">

> Specifies the active cell for keyboard navigation. This is a controlled prop. See the [Keyboard Navigation](/docs/learn/keyboard-navigation/navigating-cells) page for more details.

See <PropLink name="defaultActiveCellIndex" /> for the uncontrolled version of this prop and <PropLink name="keyboardNavigation" /> for the keyboard navigation behavior.

Use the <PropLink name="onActiveCellIndexChange" /> callback to be notified when the active cell changes.

`null` is a valid value, and it means no cell is currently rendered as active. Especially useful for controlled scenarios, when you need ultimate control over the behavior of keyboard navigation.

<Sandpack title="Controlled keyboard navigation for cells">

<Description>

This example starts with cell `[2,0]` already active.

</Description>

```ts file="$DOCS/learn/keyboard-navigation/navigating-cells-controlled-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="activeRowIndex" type="number | null">

> Specifies the active row for keyboard navigation. This is a controlled prop. See the [Keyboard Navigation](/docs/learn/keyboard-navigation/navigating-rows) page for more details.

See <PropLink name="defaultActiveRowIndex" /> for the uncontrolled version of this prop and <PropLink name="keyboardNavigation" /> for the keyboard navigation behavior.

Use the <PropLink name="onActiveRowIndexChange" /> callback to be notified when the active row changes.

`null` is a valid value, and it means no row is currently rendered as active. Especially useful for controlled scenarios, when you need ultimate control over the behavior of keyboard navigation.

<Sandpack title="Controlled keyboard navigation for rows">

<Description>

This example starts with row at index `2` already active.

</Description>

```ts file="$DOCS/learn/keyboard-navigation/navigating-rows-controlled-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="autoSizeColumnsKey" type="number|string|{key,includeHeader,columnsToSkip,columnsToResize}">

> Controls auto-sizing of columns.

Here is a list of possible values for `autoSizeColumnsKey`:

- `string` or `number` - when the value is changing, all columns will be auto-sized.

- an object with a `key` property (of type `string` or `number`) - whenever the `key` changes, the columns will be auto-sized. Specifying an object for `autoSizeColumnsKey` gives you more control over which columns are auto-sized and if the size measurements include the header or not.

When an object is used, the following properties are available:

- `key` - mandatory property, which, when changed, triggers the update
- `includeHeader` - optional boolean, - decides whether the header will be included in the auto-sizing calculations. If not specified, `true` is assumed.
- `columnsToSkip` - a list of column ids to skip from auto-sizing. If this is used, all columns except those in the list will be auto-sized.
- `columnsToResize` - the list of column ids to include in auto-sizing. If this is used, only columns in the list will be auto-sized.

<Sandpack title="Auto-sizing columns">

```tsx file="autoSizeColumnsKey-example.page.tsx"

```

</Sandpack>

<Note>

When auto-sizing takes place, <PropLink name="onColumnSizingChange" /> is called with the new column sizes. If you use controlled <PropLink name="columnSizing" />, make sure you update its value accordingly.

</Note>

<Note>

When columns are auto-sized, keep in mind that only visible (rendered) rows are taken into account - so if you scroll new rows into view, auto-sizing columns may result in different column sizes.

In the same logic, keep in mind that by default columns are also virtualized (controlled by <PropLink name="virtualizeColumns" />), not only rows, so only visible columns are auto-sized (in case you have more columns, the columns that are not currently visible do not change their sizes).

</Note>

</Prop>

<Prop name="columnDefaultEditable" type="boolean">

> Specifies whether columns are editable by default.

To enable editing globally, you can use this boolean prop on the `InfiniteTable` component. It will enable the editing on all columns.

Or you can be more specific and choose to make individual columns editable via the <PropLink name="columns.defaultEditable">column.defaultEditable</PropLink> prop.

In addition to the props already in discussion, you can use the <PropLink name="editable" /> prop on the `InfiniteTable` component. This overrides all other properties and when it is defined, is the only source of truth for whether something is editable or not.

<Sandpack>

<Description>

All columns are configured to not be editable, except the `salary` column.

</Description>

```ts file="global-should-accept-edit-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="columnDefaultSortable" type="boolean" defaultValue={true}>

> Specifies whether columns are sortable by default.

This property is overriden by (in this order) the following props:

- <PropLink name="columnTypes.defaultSortable" />
- <PropLink name="column.defaultSortable" />
- <PropLink name="sortable" />

When specified, <PropLink name="sortable" /> overrides all other properties and is the only source of truth for whether something is sortable or not.

<Note>

This property does not apply for group columns, since for sorting, group columns generally depend on the columns they are grouping.

In some cases, you can have group columns that group by fields that are not bound to actual columns, so for determining sorting for group columns, use one of the following props:

- <PropLink name="columnTypes.defaultSortable" />
- <PropLink name="column.defaultSortable" />
- <PropLink name="sortable" />

</Note>

</Prop>

<Prop name="sortable" type="boolean | ({column, columns, api, columnApi}) => boolean">

> This prop is the ultimate source of truth on whether (and which) columns are sortable.

This property overrides all the following props:

- <PropLink name="columnDefaultSortable" /> (this is the base value, overriden by all other props in this list, in this order)
- <PropLink name="columnTypes.defaultSortable" />
- <PropLink name="column.defaultSortable" />

The <PropLink name="sortable" /> prop is designed to be used for highly advanced scenarios, where you need to have ultimate control over which columns are sortable and which are not - in this case, you will want to declare <PropLink name="sortable" /> as a function, which returns `true/false` for every column.

</Prop>

<Prop name="columnDefaultWidth" type="number" defaultValue={200}>

> Specifies the a default width for all columns.

<Note>

If a column is explicitly sized via <PropLink name="columns.defaultWidth">column.defaultWidth</PropLink>, <PropLink name="columns.defaultFlex">column.defaultFlex</PropLink>, <PropLink name="columnSizing.width" /> (or <PropLink name="defaultColumnSizing.width" />), that will be used instead.

</Note>

Use <PropLink name="columnMinWidth" /> to set a minimum width for all columns.
Use <PropLink name="columnMaxWidth" /> to set a maximum width for all columns.

<PropLink name="columnMinWidth" /> and <PropLink name="columnMaxWidth" /> will be very useful once flex column sizing lands.

<Sandpack>

```ts file="columnDefaultWidth-example.page.tsx"

```

```ts file="data.ts"

```

</Sandpack>
</Prop>

<Prop name="columnHeaderHeight" type="number">

> The height of the column header.

This only refers to the height of the header label - so if you have another row in the column header, for filters, the filters will also have this height. Also, for column groups, each additional group will have this height.

<Sandpack>

<Description>

The column header height is set to `60` pixels. The column filters will also pick up this height.

</Description>

```ts file="columnHeaderHeight-example.page.tsx"

```

```ts file="data.ts"

```

</Sandpack>
</Prop>

<Prop name="columnMaxWidth" type="number" defaultValue={2000}>

> Specifies the maximum width for all columns.

For specifying the minimum column width, see <PropLink name="columnMinWidth" />.

Maximum column width can be controlled more granularly via <PropLink name="columnSizing.maxWidth" />, on a per column level.

<Sandpack>

```tsx file="columnMaxWidth-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="columnMinWidth" type="number" defaultValue={30}>

> Specifies the minimum width for all columns.

For specifying the maximum column width, see <PropLink name="columnMaxWidth" />.

Minimum column width can be controlled more granularly via <PropLink name="columnSizing.minWidth" /> or <PropLink name="columns.minWidth" />, on a per column level.

<Sandpack>

```tsx file="columnMinWidth-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="columnOrder" type="string[]|true">

> Defines the order in which columns are displayed in the component

For uncontrolled usage, see <PropLink name="defaultColumnOrder" />.

When using this controlled prop, make sure you also listen to <PropLink name="onColumnOrderChange" />

See [Column Order](/docs/learn/columns/column-order) for more details on ordering columns both programatically and via drag & drop.

<Note>

The `columnOrder` array can contain identifiers that are not yet defined in the <PropLink name="columns" /> Map or can contain duplicate ids. This is a feature, not a bug. We want to allow you to use the `columnOrder` in a flexible way so it can define the order of current and future columns.

Displaying the same column twice is a perfectly valid use case.

</Note>

<Sandpack title="Column order">

```ts file="columnOrder-example.page.tsx"

```

</Sandpack>

This prop can either be an array of strings (column ids) or the boolean `true`. When `true`, all columns present in the <PropLink name="columns" /> object will be displayed, in the iteration order of the object keys.

<Sandpack title="Column order advanced example">

```ts file="columnOrder-advanced-example.page.tsx"

```

</Sandpack>

<Note>

Using <PropLink name="columnOrder" /> in combination with <PropLink name="columnVisibility" /> is very powerful - for example, you can have a specific column order even for columns which are not visible at a certain moment, so when they will be made visible, you'll know exactly where they will be displayed.

</Note>

</Prop>

<Prop name="columns" type="Record<string, InfiniteTableColumn<DATA_TYPE>>">

> Describes the columns available in the component.

The following properties are available:

- <PropLink name="columns.field">field</PropLink>
- <PropLink name="columns.defaultWidth">defaultWidth</PropLink>
- <PropLink name="columns.defaultFlex">defaultFlex</PropLink>
- <PropLink name="columns.render">render</PropLink>
- <PropLink name="columns.renderValue">renderValue</PropLink>
- <PropLink name="columns.type">type</PropLink>
- <PropLink name="columns.header">header</PropLink>
- <PropLink name="columns.valueGetter">valueGetter</PropLink>
- <PropLink name="columns.valueFormatter">valueFormatter</PropLink>
- ...etc

<Sandpack>

```ts file="columns-example.page.tsx"

```

```ts file="data.ts"

```

</Sandpack>
</Prop>

<Prop name="columns.className" type="string | (param: InfiniteTableColumnStyleFnParams) => string">

> Controls styling via CSS classes for the column. Can be a `string` or a function returning a `string` (a valid className).

If defined as a function, it accepts an object as a parameter (of type <TypeLink name="InfiniteTableColumnStylingFnParams" />), which has the following properties:

- `column` - the current column where the className is being applied
- `data` - the data object for the current row. The type of this object is `DATA_TYPE | Partial<DATA_TYPE> | null`. For regular rows, it will be of type `DATA_TYPE`, while for group rows it will be `Partial<DATA_TYPE>`. For rows not yet loaded (because of batching being used), it will be `null`.
- `rowInfo` - the information about the current row - see [Using RowInfo](/docs/learn/rows/using-row-info) for more details.
- `value` - the underlying value of the current cell - will generally be `data[column.field]`, if the column is bound to a `field` property
- ... and more, see <TypeLink name="InfiniteTableColumnStylingFnParams" /> for details

<Note>

The `className` property can also be specified for <PropLink name="columnTypes"/>

</Note>

<Sandpack>

```ts file="column-className-function-example.page.tsx"

```

```css file="coloring.module.css"

```

</Sandpack>
</Prop>

<Prop name="components">

> Components to override the default ones used by the DataGrid.

The following components can be overridden:

- `LoadMask` - see <PropLink name="components.LoadMask" />
- `CheckBox`
- `Menu`
- `MenuIcon`

</Prop>

<Prop name="components.LoadMask">

> Allows customising the `LoadMask` displayed over the DataGrid when it's loading data.

<Note>

To better test this out, you can use the controlled <DPropLink name="loading" /> prop on the `<DataSource />`
</Note>

For more components that can be overriden, see <PropLink name="components" />

<Sandpack title="Custom LoadMask component">

```tsx file="load-mask-example.page.tsx"

```

</Sandpack>

</Prop>
<Prop name="columns.renderRowDetailIcon" type="boolean|(cellContext) => ReactNode">

> Renders the row detail expand/collapse icon in the column cell. Only used when [master-detail](/docs/learn/master-detail/overview) is enabled.

If this function is a prop, it can be used to customize the icon rendered for expanding/collapsing the row detail.

See related <PropLink name="rowDetailRenderer" /> for configuring master-detail.

<Sandpack title="Basic master detail DataGrid example" size="lg">

<Description>

This example shows a master DataGrid with the ID column configured to show the row detail expand icon.

</Description>

```ts file="$DOCS/learn/master-detail/master-detail-example.page.tsx"

```

</Sandpack>

</Prop>
<Prop name="columns.components">

> Specifies custom React components to use for column cells or header

The column components object can have either of the two following properties:

- <PropLink name="columns.components.ColumnCell">ColumnCell</PropLink> - a React component to use for rendering the column cells
- <PropLink name="columns.components.HeaderCell">HeaderCell</PropLink> - a React component to use for rendering the column header

- <PropLink name="columns.components.Editor">Editor</PropLink> - a React component to use for the editor, when editing is enabled for the column

See [editing docs](/docs/learn/editing/overview).

</Prop>

<Prop name="columns.components.ColumnCell">

> Specifies a custom React component to use for column cells

For column header see related <PropLink name="columns.components.HeaderCell"/>.

Inside a component used as a cell, you have to use <HookLink name="useInfiniteColumnCell"/> to retrieve information about the currently rendered cell.

<Note>

It's very important that you take

```tsx
const { domRef } = useInfiniteColumnCell<DATA_TYPE>();
```

the `domRef` from the <HookLink name="useInfiniteColumnCell"/> hook and pass it on to the root DOM element of your cell component.

```tsx
<div ref={domRef}>...</div>
```

**If you don't do this, the column rendering will not work.**

</Note>

<Note>

Also note that your React Component should be a functional component and have this signature

```tsx
function CustomComponent(props: React.HTMLProps<HTMLDivElement>) {
  return ...
}
```

that is, the `props` that the component is rendered with (is called with) are `HTMLProps` (more exactly `HTMLProps<HTMLDivElement>`) that you need to spread on the root DOM element of your component. If you want to customize anything, you can, for example, append a `className` or specify some extra styles.

In order to access the cell-related information, you don't use the props, but you call the <HookLink name="useInfiniteColumnCell"/> hook.

```tsx
const ExampleCellComponent: React.FunctionComponent<
  React.HTMLProps<HTMLDivElement>
> = (props) => {
  const { domRef } = useInfiniteColumnCell<Developer>();

  return (
    <div
      ref={domRef}
      {...props}
      className={`${props.className} extra-cls`}
      style={style}
    >
      {props.children} <div style={{ flex: 1 }} /> {emoji}
    </div>
  );
};
```

</Note>

<Sandpack title="Custom components">

```tsx file="column-components-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="columns.components.Editor">

> Specifies a custom React component to use for the editor, when [editing](/docs/learn/editing/overview) is enabled for the column.

The editor component should use the <HookLink name="useInfiniteColumnEditor"/> hook to have access to cell-related information and to confirm, cancel or reject the edit.

Here's the implementation for our default editor

```tsx
export function InfiniteTableColumnEditor<T>() {
  const { initialValue, setValue, confirmEdit, cancelEdit, readOnly } =
    useInfiniteColumnEditor<T>();

  const domRef = useRef<HTMLInputElement>();
  const refCallback = React.useCallback((node: HTMLInputElement) => {
    domRef.current = node;

    if (node) {
      node.focus();
    }
  }, []);

  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    const { key } = event;
    if (key === 'Enter' || key === 'Tab') {
      confirmEdit();
    } else if (key === 'Escape') {
      cancelEdit();
    } else {
      event.stopPropagation();
    }
  }, []);

  return (
    <>
      <input
        readOnly={readOnly}
        ref={refCallback}
        onKeyDown={onKeyDown}
        onBlur={() => confirmEdit()}
        className={'...'}
        type={'text'}
        defaultValue={initialValue}
        onChange={useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
          setValue(event.target.value);
        }, [])}
      />
    </>
  );
}
```

<Sandpack title="Column with custom editor">

<Description>

Try editing the `salary` column - it has a custom editor

</Description>

```tsx file="$DOCS/reference/hooks/custom-editor-hooks-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="columns.components.HeaderCell">

> Specifies a custom React component to use for column headers

For column cells see related <PropLink name="columns.components.ColumnCell"/>.

Inside a custom component used as a column header, you have to use <HookLink name="useInfiniteHeaderCell"/> to retrieve information about the currently rendered header cell.

<Note>

It's very important that you take

```tsx
const { domRef } = useInfiniteColumnCell<DATA_TYPE>();
```

the `domRef` from the <HookLink name="useInfiniteHeaderCell"/> hook and pass it on to the root DOM element of your header component.

```tsx
<div ref={domRef}>...</div>
```

**If you don't do this, the column header rendering will not work.**

</Note>

<Note>

Also note that your React Component should be a functional component and have this signature

```tsx
function CustomHeaderComponent(props: React.HTMLProps<HTMLDivElement>) {
  return ...
}
```

that is, the `props` that the component is rendered with (is called with) are `HTMLProps` (more exactly `HTMLProps<HTMLDivElement>`) that you need to spread on the root DOM element of your component. If you want to customize anything, you can, for example, append a `className` or specify some extra styles.

In order to access the column header-related information, you don't use the props, but you call the <HookLink name="useInfiniteHeaderCell"/> hook.

```tsx
const ExampleHeaderComponent: React.FunctionComponent<
  React.HTMLProps<HTMLDivElement>
> = (props) => {
  const { domRef } = useInfiniteHeaderCell<Developer>();

  return (
    <div
      ref={domRef}
      {...props}
      className={`${props.className} extra-cls`}
      style={style}
    >
      {props.children} <div style={{ flex: 1 }} /> {emoji}
    </div>
  );
};
```

</Note>

<Sandpack title="Custom components">

```tsx file="column-components-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="columns.contentFocusable" type="boolean|(params) => boolean">

> Specifies if the column (or cell, if a function is used) renders content that will/should be focusable (via tab-navigation)

<Sandpack title="Columns with cell content focusable">

```ts file="column-contentFocusable-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="columns.cssEllipsis" type="boolean" defaultValue={true}>

> Specifies if the column should show ellipsis for content that is too long and does not fit the column width.

<Note>

For header ellipsis, see related <PropLink name="headerCssEllipsis" />.

</Note>

<Sandpack title="First name column(first) has cssEllipsis set to false">

```ts file="columns-cssEllipsis-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="columns.dataType" type="string">

> Specifies the type of the data for the column. For now, it's better to simply use <PropLink name="columns.type" />.

If a column doesn't specify a <PropLink name="columns.sortType">sortType</PropLink>, the `dataType` will be used instead to determine the type of sorting to use. If neither `sortType` nor `dataType` are specified, the <PropLink name="columns.type">column.type</PropLink> will be used.

</Prop>

<Prop name="columns.defaultEditable" type="boolean|(param)=>boolean|Promise<boolean>">

> Controls if the column is editable or not.

This overrides the global <PropLink name="columnDefaultEditable" />.
This is overridden by the <PropLink name="editable" /> prop.

The value for this property can be either a `boolean` or a function.

If it is a function, it will be called when an edit is triggered on the column. The function will be called with a single object that contains the following properties:

- `value` - the current value of the cell (the value currently displayed, so after <PropLink name="columns.valueFormatter" /> and <PropLink name="columns.renderValue" /> have been applied)
- `rawValue` - the current value of the cell, but before any formatting and custom rendering has been applied. This is either the field value from the current data object, or the result of the column <PropLink name="columns.valueGetter">valueGetter</PropLink> function.
- `data` - the data object (of type `DATA_TYPE`) for the current row
- `rowInfo` - the row info object that underlies the row
- `column` - the current column on which editing is invoked
- `api` - a reference to the [InfiniteTable API](/docs/reference/api)
- `dataSourceApi` - - a reference to the [DataSource API](/docs/reference/datasource-api)

The function can return a `boolean` value or a `Promise` that resolves to a `boolean` - this means you can asynchronously decide whether the cell is editable or not.

Making <PropLink name="columns.defaultEditable">column.defaultEditable</PropLink> a function gives you the ability to granularly control which cells are editable or not (even within the same column, based on the cell value or other values you have access to).

<Sandpack>

<Description>

Only the `salary` column is editable.

</Description>

```ts file="global-should-accept-edit-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="columns.defaultFlex" type="number" >

> Specifies a default flex for the column

<Note>

If you want more control on sizing, use controlled <PropLink name="columnSizing" /> (or uncontrolled <PropLink name="defaultColumnSizing" />).
</Note>

See related <PropLink name="columns.defaultWidth" />

</Prop>

<Prop name="columns.defaultHiddenWhenGroupedBy" type="'*'| true | keyof DATA_TYPE | { [keyof DATA_TYPE]: true }">

> Controls default column visibility when <DataSourcePropLink name="groupBy" /> is used.

This property does not apply (work) when controlled <PropLink name="columnVisibility"  /> is used, it only works with uncontrolled column visibility.

The value for this property can be one of the following:

- the `'*'` string - this means, the column is hidden whenever there are groups - so any groups.
- a `string`, namely a field from the bound type of the `DataSource` (so type is `keyof DATA_TYPE`) - the column is hidden whenever there is grouping that includes the specified field. The grouping can contain any other fields, but if it includes the specified field, the column is hidden.
- `true` - the column is hidden when there grouping that uses the field that the column is bound to.
- `an object with keys` of type `keyof DATA_TYPE` and values being `true` - whenever the grouping includes any of the fields that are in the keys of this object, the column is hidden.

<Sandpack>

```ts file="columnDefaultHiddenWhenGroupedBy-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="columns.defaultWidth" type="number" >

> Specifies a default width for the column

<Note>

If you want more control on sizing, use controlled <PropLink name="columnSizing" /> (or uncontrolled <PropLink name="defaultColumnSizing" />).
</Note>

See related <PropLink name="columns.defaultFlex" />

</Prop>

<Prop name="columns.field" type="keyof DATA_TYPE">

> Binds the column to the specified data field. It should be a keyof `DATA_TYPE`.

It can be the same or different to the column id. This is not used for referencing the column in various other props - the column key (column id) is used for that.

If no <PropLink name="columns.header" /> is specified, it will be used as the column header.

<Sandpack>

```ts file="columns-example.page.tsx"

```

```ts file="data.ts"

```

</Sandpack>

Group columns can also be bound to a field, like in the snippet below.

<Sandpack>

<Description>
In this example, the group column is bound to the `firstName` field, so this field will be rendered in non-group rows for this column.
</Description>

```ts file="group-column-bound-to-field-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="columns.filterType" type="string">

> Use this to configure the filter type for the column, when the `filterType` needs to be different from the column <PropLink name="columns.type">type</PropLink>.

See related <PropLink name="columns.type" />

<Note>

If the type of filter you want to show does not match the column <PropLink name="columns.type">type</PropLink>, you can specify the filter with the <PropLink name="columns.filterType">column.filterType</PropLink> property. Only use this when the type of the data differs from the type of the filter (eg: you have a numeric column, with a custom filter type).

</Note>

<Sandpack title="Custom column filterType for the salary column">

<Description>

In this example, the `salary` column has `type="number"` and `filterType="salary"`.

This means the sort order defined for `type="number"` will be used while displaying a custom type of filter.

</Description>

```ts file="column-filterType-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="columns.getValueToEdit" type="(params) => any|Promise<any>">

> Allows customizing the value that will be passed to the cell editor when it is displayed (when editing starts).

The function is called with an object that has the following properties:

- `value` - the value of the cell (the value that is displayed in the cell before editing starts). This is the value resulting after <PropLink name="columns.valueFormatter" /> and <PropLink name="columns.renderValue" /> have been applied)
- `rawValue` - the raw value of the cell, before any formatting and custom rendering has been applied. This is either the field value from the current data object, or the result of the column <PropLink name="columns.valueGetter">valueGetter</PropLink> function.
- `data` - the current data object
- `rowInfo` - the row info object that underlies the row
- `column` - the current column on which editing is invoked
- `api` - a reference to the [InfiniteTable API](/docs/reference/api)
- `dataSourceApi` - - a reference to the [DataSource API](/docs/reference/datasource-api)

<Note>

This function can be async. Return a `Promise` to wait for the value to be resolved and then passed to the cell editor.

</Note>

See related <PropLink name="columns.getValueToPersist" /> and <PropLink name="columns.shouldAcceptEdit" />.

<Sandpack>

<Description>

In this example, the `salary` for each row includes the currency string.

<p>When editing starts, we want to remove the currency string and only show the numeric value in the editor - we do this via <PropLink name="columns.getValueToEdit" />.</p>

</Description>

```ts file="inline-editing-custom-edit-value-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="columns.getValueToPersist" type="(params) => any|Promise<any>">

> Allows customizing the value that will be persisted when an edit has been accepted.

The function is called with an object that has the following properties:

- `initialValue` - the initial value of the cell (the value that was displayed in the cell before editing started). This is the value resulting after <PropLink name="columns.valueFormatter" /> and <PropLink name="columns.renderValue" /> have been applied)
- `value` - the current value that was accepted as an edit and which came from the cell editor.
- `rawValue` - the raw value of the cell, before any formatting and custom rendering has been applied. This is either the field value from the current data object, or the result of the column <PropLink name="columns.valueGetter">valueGetter</PropLink> function.
- `data` - the current data object
- `rowInfo` - the row info object that underlies the row
- `column` - the current column on which editing is invoked
- `api` - a reference to the [InfiniteTable API](/docs/reference/api)
- `dataSourceApi` - - a reference to the [DataSource API](/docs/reference/datasource-api)

<Note>

This function can be async. Return a `Promise` to wait for the value to be resolved and then persisted.

</Note>

See related <PropLink name="columns.getValueToEdit" /> and <PropLink name="columns.shouldAcceptEdit" />.

<Sandpack>

<Description>

In this example, the `salary` for each row includes the currency string.

<p>When an edit is accepted, we want the persisted value to include the currency string as well (like the original value did) - we do this via <PropLink name="columns.getValueToPersist" />.</p>

</Description>

```ts file="inline-editing-custom-edit-value-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="columns.renderHeader" type="(param: InfiniteTableColumnHeaderParam) => ReactNode">

> A custom rendering function for the column header. Called with an object of type <TypeLink name="InfiniteTableColumnHeaderParam" />.

It's the equivalent of <PropLink name="columns.renderValue" /> but for the <PropLink name="columns.header">column.header</PropLink>.

It gives you access to the column, along with information about sorting, filtering, grouping, etc.

It is called with a single argument, of type <TypeLink name="InfiniteTableColumnHeaderParam" />.

</Prop>

<Prop name="columns.header" type="React.ReactNode|({column, columnSortInfo, columnApi})=>React.ReactNode">

> Specifies the column header. Can be a static value or a function that returns a React node.

<Note>

If no `header` is specified for a column, the <PropLink name="columns.field">field</PropLink> will be used instead.

</Note>

If a function is provided, it will be called with an argument with the following properties:

- `column`
- `columnSortInfo` - will allow you to render custom header based on the sort state of the column.
- `columnApi` - [API](reference/column-api) for the current column. Can be useful if you customize the header and want to programatically trigger actions like sorting, show/hide column menu, etc.

When we implement filtering, you'll also have access to the column filter.

<Note>

For styling the column header, you can use <PropLink name="columns.headerStyle">headerStyle</PropLink> or <PropLink name="columns.headerClassName">headerClassName</PropLink>.

For configuring the column header height, see the <PropLink name="columnHeaderHeight" /> prop.

</Note>

<Sandpack>

```ts file="columns-header-example.page.tsx"

```

```ts file="data.ts"

```

</Sandpack>

<Note>

In the `column.header` function you can use hooks or <PropLink name="columns.components.HeaderCell" nocode>render custom React components via column.components.HeaderCell</PropLink>. To make it easier to access the param of the `header` function, we've exposed the <HookLink name="useInfiniteHeaderCell" /> - use it to gain access to the same object that is passed as an argument to the `header` function.

</Note>

<Sandpack title="Column with custom header that uses useInfiniteHeaderCell">

```ts file="column-header-hooks-example.page.tsx"

```

</Sandpack>

<Sandpack title="Custom header with button to trigger the column context menu">

<Description>

The `preferredLanguage` column has a custom header that shows a button for triggering the column context menu.

In addition, the currency and preferredLanguage columns have a custom context menu icon.

</Description>

```ts file="getColumnMenuItems-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="columns.headerClassName" type="string | (args) => string">

> Controls the css class name for the column header. Can be a string or a function returning a string.

If defined as a function, it accepts an object as a parameter, which has the following properties:

- `column` - the current column where the style is being applied
- `columnSortInfo` - the sorting information for the column
- `columnFilterValue` - the filtering information for the column
- `dragging` - whether the current column is being dragged at the current time (during a column reorder)

<Note>

The `headerClassName` property can also be specified for <PropLink name="columnTypes.headerClassName">columnTypes</PropLink>.

For styling with inline styles, see <PropLink name="columns.headerStyle" />.

</Note>

</Prop>

<Prop name="columns.headerCssEllipsis" type="boolean" defaultValue={true}>

> Specifies if the column should show ellipsis in the column header if the header is too long and does not fit the column width.

If this property is not specified, the value of <PropLink name="columns.cssEllipsis" /> will be used.

<Note>

For normal cell ellipsis, see related <PropLink name="cssEllipsis" />.

</Note>

<Sandpack title="Preferred Language column(second) has headerCssEllipsis set to false">

```ts file="columns-cssEllipsis-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="columns.headerStyle" type="CSSProperties | (args) => CSSProperties">

> Controls styling for the column header. Can be a style object or a function returning a style object.

If defined as a function, it accepts an object as a parameter, which has the following properties:

- `column` - the current column where the style is being applied
- `columnSortInfo` - the sorting information for the column
- `columnFilterValue` - the filtering information for the column
- `dragging` - whether the current column is being dragged at the current time (during a column reorder)

<Note>

The `headerStyle` property can also be specified for <PropLink name="columnTypes.headerStyle">columnTypes</PropLink>.

For styling with CSS, see <PropLink name="columns.headerClassName" />.

For configuring the column header height, see the <PropLink name="columnHeaderHeight" /> prop.

</Note>

</Prop>

<Prop name="columns.maxWidth" type="number">

> Configures the maximum width for the column.

If not specified, <PropLink name="columnMaxWidth" /> will be used (defaults to `2000`).

</Prop>

<Prop name="columns.minWidth" type="number">

> Configures the minimum width for the column.

If not specified, <PropLink name="columnMinWidth" /> will be used (defaults to `30`).

</Prop>

<Prop name="columns.render" type="(cellContext) => Renderable">

> Customizes the rendering of the column. The argument passed to the function is an object of type <TypeLink name="InfiniteTableColumnCellContextType" />

See related <PropLink name="columns.renderValue" />, <PropLink name="columns.renderGroupValue" />

<Note>

The difference between <PropLink name="columns.render"/> and <PropLink name="columns.renderValue"/> is only for special columns (for now, only group columns are special columns, but more will come) when `InfiniteTable` renders additional content inside the column (eg: collapse/expand tool for group rows). The <PropLink name="columns.render"/> function allows you to override the additional content. So if you specify this function, it's up to you to render whatever content, including the collapse/expand tool.

Note that for customizing the collapse/expand tool, you can use specify `renderGroupIcon` function on the group column.

</Note>

<Hint>

To understand how the rendering pipeline works, head over to the page on [Column rendering](/docs/learn/columns/column-rendering#rendering-pipeline).

</Hint>

The <PropLink name="columns.render">render</PropLink> and <PropLink name="columns.renderValue">renderValue</PropLink> functions are called with an object that has the following properties:

- data - the data object (of type `DATA_TYPE | Partial<DATA_TYPE> | null`) for the row.
- rowInfo - very useful information about the current row. See [Using RowInfo](/docs/learn/rows/using-row-info) for more details.
- renderBag - read more about this in the docs for [Column rendering pipeline](/docs/learn/columns/column-rendering#rendering-pipeline)

<Sandpack title="Column with custom render">

```ts file="column-render-example.page.tsx"

```

</Sandpack>

<Note>

In the `column.render` function you can use hooks or <PropLink name="columns.components.ColumnCell" nocode>render custom React components</PropLink>. To make it easier to access the param of the `render` function, we've exposed the <HookLink name="useInfiniteColumnCell" /> - use it to gain access to the same object that is passed as an argument to the `render` function.

</Note>

<Sandpack title="Column with custom render that uses useInfiniteColumnCell">

```ts file="column-render-hooks-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="columns.renderFilterIcon">

> Customizes the rendering of the filter icon for the column.

<Sandpack title="Custom filter icons for salary and name columns">

<Description>

The `salary` column will show a bolded label when filtered.

The `firstName` column will show a custom filter icon when filtered.

</Description>

```ts file="$DOCS/learn/columns/column-filter-icon-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="columns.renderGroupIcon" type="(cellContext) => Renderable">

> Customizes the rendering of the collapse/expand group icon for group rows. The argument passed to the function is an object of type <TypeLink name="InfiniteTableColumnCellContextType" />

For actual content of group cells, see related <PropLink name="columns.renderGroupValue" />

<Hint>

To understand how the rendering pipeline works, head over to the page on [Column rendering](/docs/learn/columns/column-rendering#rendering-pipeline).

</Hint>

<Sandpack title="Column with custom renderGroupIcon">

```tsx file="column-renderGroupValueAndRenderLeafValue-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="columns.renderMenuIcon" type="boolean|(cellContext)=> ReactNode">

> Allows customization of the context menu icon.

Use this prop to customize the context icon for the current column. Specify `false` for no context menu icon.

Use a function to render a custom icon. The function is called with an object that has the following properties:

- `column`
- `columnApi` - an API object for controlling the column programatically (toggle sort, toggle column context menu, etc)

<Sandpack title="Custom menu icons and custom menu items">

<Description>

In this example, the currency and preferredLanguage columns have a custom icon for triggering the column context menu.

In addition, the `preferredLanguage` column has a custom header that shows a button for triggering the column context menu.

</Description>

```ts file="getColumnMenuItems-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="columns.renderSelectionCheckBox" type="boolean | ({ data, rowSelected: boolean | null, selectRow, deselectRow, ... })">

> Specifies that the current column will have a selection checkbox - if a function is provided, will be used to customizes the rendering of the checkbox rendered for selection.

See related <DPropLink name="rowSelection" />.

If `true` is provided, the default selection checkbox will be rendered. When a function is provided, it will be used for rendering the checkbox for selection.

<Note>

`rowSelected` property in the function parameter can be either `boolean` or `null`. The `null` value is used for groups with indeterminate state, meaning the group has some children selected, but not all of them.
</Note>

<Hint>

To understand how the rendering pipeline works, head over to the page on [Column rendering](/docs/learn/columns/column-rendering#rendering-pipeline).

</Hint>

<Sandpack title="Column with custom renderSelectionCheckBox">

<Description>
This example shows how you can use the default selection checkbox and decorate it.
</Description>

```tsx file="column-renderSelectionCheckBox-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="columns.renderGroupValue" type="({ data, rowInfo, column, renderBag, rowIndex, ... })">

> Customizes the rendering of a group column content, but only for group rows.

This prop is different from <PropLink name="columns.render" />, <PropLink name="columns.renderValue" />, as it is only called for group rows.

<Note>

This function prop is called with a parameter - the `value` property of this parameter is not useful for group rows (of non-group columns), as it refers to the current data item, which is a group item, not a normal data item. Instead, use `rowInfo.value`, as that's the current group row value.

</Note>

See related <PropLink name="columns.renderGroupIcon" /> for customizing the collapse/expand group icon.
See related <PropLink name="columns.renderLeafValue" /> for customizing the value for non-group rows in a group column.

<Sandpack title="Column with custom renderGroupValue">

```tsx file="column-renderGroupValueAndRenderLeafValue-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="columns.renderLeafValue" type="({ data, rowInfo, column, renderBag, rowIndex, ... })">

> Customizes the rendering of the group column content, but only for non-group rows.

See related <PropLink name="columns.renderGroupValue" /> for customizing the value for group rows in a group column.

<Sandpack title="Column with custom renderLeafValue">

```tsx file="column-renderGroupValueAndRenderLeafValue-example.page.tsx"

```

</Sandpack>

</Prop>
<Prop name="columns.renderValue" type="(cellContext) => Renderable">

> Customizes the rendering of the column content. The argument passed to the function is an object of type <TypeLink name="InfiniteTableColumnCellContextType" />

See related <PropLink name="columns.render" />, <PropLink name="columns.renderGroupValue" />

<Note>

The difference between <PropLink name="columns.renderValue"/> and <PropLink name="columns.render"/> is only for special columns (for now, only group columns are special columns, but more will come) when `InfiniteTable` renders additional content inside the column (eg: collapse/expand tool for group rows). The <PropLink name="columns.render"/> function allows you to override the additional content. So if you specify this function, it's up to you to render whatever content, including the collapse/expand tool.

Note that for customizing the collapse/expand tool, you can use specify `renderGroupIcon` function on the group column.

</Note>

<Hint>

To understand how the rendering pipeline works, head over to the page on [Column rendering](/docs/learn/columns/column-rendering#rendering-pipeline).

</Hint>

The <PropLink name="columns.renderValue">renderValue</PropLink> and <PropLink name="columns.render">render</PropLink> functions are called with an object that has the following properties:

- data - the data object (of type `DATA_TYPE | Partial<DATA_TYPE> | null`) for the row.
- rowInfo - very useful information about the current row. See [Using RowInfo](/docs/learn/rows/using-row-info) for more details.
- renderBag - read more about this in the docs for [Column rendering pipeline](/docs/learn/columns/column-rendering#rendering-pipeline)

<Sandpack title="Column with custom renderValue">

```tsx file="column-renderValue-example.page.tsx"

```

</Sandpack>

<Note>

In the `column.renderValue` function you can use hooks or <PropLink name="columns.components.ColumnCell" nocode>render custom React components</PropLink>. To make it easier to access the param of the `renderValue` function, we've exposed the <HookLink name="useInfiniteColumnCell" /> - use it to gain access to the same object that is passed as an argument to the `renderValue` function.

</Note>

<Sandpack title="Using a sparkline component" size="md" viewMode="preview" deps="react-sparklines">

```tsx file="$DOCS/learn/examples/using-sparklines-example.page.tsx" 
```

</Sandpack>

</Prop>

<Prop name="columns.resizable" type="boolean">

> Specifies if the current column is resizable or not.

By default, all columns are resizable, since <PropLink name="resizableColumns" /> defaults to `true`.

</Prop>

<Prop name="columns.rowspan" type="({ rowInfo, data, rowIndex, column }) => number">

> Specifies the rowspan for cells on the current column.

The default rowspan for a column cell is 1. If you want to span multiple rows, return a value that is greater than 1.

This function is called with an object that has the following properties:

- column - the current column
- data - the current data
- rowInfo - information about the current row

The `rowInfo` object contains information about grouping (if this row is a group row, the collapsed state, etc), parent groups, children of the current row (if it's a row group), etc. See [Using RowInfo](/docs/learn/rows/using-row-info) for more details.

<Sandpack>

```ts file="column-rowspan-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="columns.shouldAcceptEdit" type="(params) => boolean|Error|Promise<boolean|Error>">

> Function specified for the column, that determines whether to accept an edit or not.

This function is called when the user wants to finish an edit. The function is used to decide whether an edit is accepted or rejected.

<p>When the global <PropLink name="shouldAcceptEdit" /> prop is specified, this is no longer called, and instead the global one is called.</p>
<p>If you define the global <PropLink name="shouldAcceptEdit" /> and still want to use the column-level function, you can call the column-level function from the global one.</p>

The function is called with an object that has the following properties:

- `value` - the value that the user wants to persist via the cell editor
- `initialValue` - the initial value of the cell (the value that was displayed before editing started). This is the value resulting after <PropLink name="columns.valueFormatter" /> and <PropLink name="columns.renderValue" /> have been applied)
- `rawValue` - the initial value of the cell, but before any formatting and custom rendering has been applied. This is either the field value from the current data object, or the result of the column <PropLink name="columns.valueGetter">valueGetter</PropLink> function.
- `data` - the current data object
- `rowInfo` - the row info object that underlies the row
- `column` - the current column on which editing is invoked
- `api` - a reference to the [InfiniteTable API](/docs/reference/api)
- `dataSourceApi` - - a reference to the [DataSource API](/docs/reference/datasource-api)

<Sandpack>

<Description>

Try editing the `salary` column. In the editor you can write whatever, but the column will only accept edits that are valid numbers.

</Description>

```ts file="inline-editing-custom-edit-value-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="columns.sortable" type="boolean">

> Specifies the sorting behavior for the current column. Overrides the global <PropLink name="sortable" /> prop.

Use this column property in order to explicitly make the column sortable or not sortable. If not specified, the sortable prop from the column type (<PropLink name="columnTypes.sortable" />) will be used. If that is not specified either, the global <PropLink name="sortable" /> prop will be used.

</Prop>

<Prop name="columns.sortType" type="string | string[]" defaultValue="'string'">

> Specifies the sort type for the column. See related <DataSourcePropLink name="sortTypes" />

For local sorting, the sort order for a column is determined by the specified `sortType`.

- if no `sortType` is specified, the <PropLink name="columns.dataType">column.dataType</PropLink> will be used as the `sortType`
- if no `sortType` or `dataType` is specified, it will default to the <PropLink name="columns.type"/> value (if an array, the first item will be used).
- if none of those are specified `"string"` is used

The value of this prop (as specified, or as computed by the steps described above) should be a key from the <DataSourcePropLink name="sortTypes" /> object.

<Sandpack  title="Custom sort by color - magenta will come first">

```ts file="./datasource-props/sortTypes-example.page.tsx"

```

</Sandpack>

<Note>

For group columns (and more specifically, when <PropLink name="groupRenderStrategy"/> is `single-column`), the `sortType` should be a `string[]`, each item in the array corresponding to an item in <DPropLink name="groupBy" /> of the `<DataSource />`. This is especially useful when there are no corresponding columns for the `groupBy` fields. In this case, `InfiniteTable` can't know the type of sorting those fields will require, so you have to provide it yourself via the `column.sortType`.
</Note>

</Prop>

<Prop name="columns.style" type="CSSProperties | (param: InfiniteTableColumnStyleFnParams) => CSSProperties">

> Controls styling for the column. Can be a style object or a function returning a style object.

If defined as a function, it accepts an object as a parameter (of type <TypeLink name="InfiniteTableColumnStylingFnParams" />), which has the following properties:

- `column` - the current column where the style is being applied
- `data` - the data object for the current row. The type of this object is `DATA_TYPE | Partial<DATA_TYPE> | null`. For regular rows, it will be of type `DATA_TYPE`, while for group rows it will be `Partial<DATA_TYPE>`. For rows not yet loaded (because of batching being used), it will be `null`.
- `rowInfo` - the information about the current row - see [Using RowInfo](/docs/learn/rows/using-row-info) for more details.
- `value` - the underlying value of the current cell - will generally be `data[column.field]`, if the column is bound to a `field` property
- ... and more, see <TypeLink name="InfiniteTableColumnStylingFnParams" /> for details

<Note>

The `style` property can also be specified for <PropLink name="columnTypes"/>

</Note>

<Sandpack>

```ts file="columns-style-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="columns.type" type="string | string[]" defaultValue="'default'">

> Specifies the column type - a column type is a set of properties that describes the column. Column types allow to easily apply the same properties to multiple columns.

<Note>

Specifying `type: "number"` for numeric columns will ensure correct number sorting function is used (when sorting is done client-side). This happens because <DPropLink name="sortTypes" /> has a definition for the `number` sort type.

For date columns (where the values in the columns are actual date objects) specify `type: "date"`. [Read more about date columns here](/docs/learn/working-with-data/handling-dates#using-date-strings)

</Note>

See <PropLink name="columnTypes"/> for more details on using column types.

<Note>

By default, all columns have the `default` column type applied. So, if you define the `default` column type, but don't specify any <PropLink name="columns.type">type</PropLink> for a column, the default column type properties will be applied to that column.

</Note>

<Note>

When you want both the default type and another type to be applied, you can do so by specifying `type: ["default", "second-type"]`.

When you dont want the default type to be applied, use `type: null`.

</Note>

If a column is filterable and does not explicitly specify a <PropLink name="columns.filterType">filterType</PropLink>, the `type` will also be used as the filter type.

If a column is sortable and does not explicitly specify a <PropLink name="columns.sortType">sortType</PropLink>, the `type` will also be used as the sort type.

See the example below - `id` and `age` columns are `type='number'`.

<Sandpack>

```ts file="columns-example.page.tsx"

```

```ts file="data.ts"

```

</Sandpack>
</Prop>

<Prop name="columns.valueFormatter" type="({ data?, isGroupRow, rowInfo, field?, rowSelected, rowActive, isGroupRow }) => Renderable">

> Customizes the value that will be rendered

The `valueFormatter` prop is the next function called after the <PropLink name="columns.valueGetter" /> during the [rendering pipeline](/docs/learn/columns/column-rendering#rendering-pipeline). Unlike <PropLink name="columns.valueGetter" />, <PropLink name="columns.valueFormatter" /> can return any renderable value, like `JSX.Element`s.

<Note>

Unlike `valueGetter`, it is being called with an object that has both the `data` item (might be null or partial for group rows) and the `rowInfo` object, and some extra flags regarding the row state (selection, active, etc). Use the TS `isGroupRow` flag as discriminator to decide if `data` is available.

</Note>

If you want to further customize what's being rendered, see related <PropLink name="columns.valueGetter" />, <PropLink name="columns.renderValue" />, <PropLink name="columns.render" />, <PropLink name="columns.renderGroupValue" />, <PropLink name="columns.renderLeafValue" /> and <PropLink name="columns.renderGroupIcon" />.

<Sandpack title="Column with custom valueFormatter">

```tsx file="column-valueFormatter-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="columns.valueGetter" type="({ data, field? }) => string | number | boolean | null | undefined">

> Customizes the value that will be rendered

The `valueGetter` prop is a function that takes a single argument - an object with `data` and `field` properties. It should return a plain JavaScript value (so not a `ReactNode` or `JSX.Element`)

<Note>

Note that the `data` property is of type `DATA_TYPE | Partial<DATA_TYPE> | null` and not simply `DATA_TYPE`, because there are cases when you can have grouping (so for group rows with aggregations `data` will be `Partial<DATA_TYPE>`) or when there are lazily loaded rows or group rows with no aggregations - for which `data` is still `null`.

</Note>

If you want to further customize what's being rendered, see related <PropLink name="columns.valueFormatter" />, <PropLink name="columns.renderValue" />, <PropLink name="columns.render" />, <PropLink name="columns.renderGroupValue" />, <PropLink name="columns.renderLeafValue" /> and <PropLink name="columns.renderGroupIcon" />.

<Sandpack title="Column with custom valueGetter">

```tsx file="column-valueGetter-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="columnSizing" type="Record<string,{width,flex,...}>">

> Defines the sizing of columns in the grid.

This is a controlled property. For the uncontrolled version, see <PropLink name="defaultColumnSizing" />.

It is an object that maps column ids to column sizing options. The values in the objects can contain the following properties:

- <PropLink name="columnSizing.flex">flex</PropLink> - use this for flexible columns. Behaves like the `flex` CSS property.
- <PropLink name="columnSizing.width">width</PropLink> - use this for fixed sized columns
- <PropLink name="columnSizing.minWidth">minWidth</PropLink> - specifies the minimum width of the column. Useful for flexible columns or for restricting users resizing both fixed and flexible columns.
- <PropLink name="columnSizing.maxWidth">maxWidth</PropLink> - specifies the maximum width of the column. Useful for flexible columns or for restricting users resizing both fixed and flexible columns.

<Sandpack title="Controlled column sizing">

```tsx file="columnSizing-example.page.tsx"

```

</Sandpack>

<Note>

For auto-sizing columns, see <PropLink name="autoSizeColumnsKey" />.

</Note>

</Prop>

<Prop name="columnSizing.flex" type="number">

> Specifies the flex value for the column.

See [using flexible column sizing section](/docs/learn/columns/fixed-and-flexible-size#using-flexible-column-sizing) for more details.

A column can either be flexible or fixed-width. For fixed columns, use <PropLink name="columnSizing.width" /> if you're using <PropLink name="columnSizing" /> or <PropLink name="columns.defaultWidth">column.defaultWidth</PropLink> for default-uncontrolled sizing.

<Sandpack title="Controlled column sizing with flex columns">

```tsx file="columnSizing-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="columnSizing.minWidth" type="number">

> Specifies the minimum width for a column. Especially useful for flexible columns.

See [Using flexible column sizing](/docs/learn/columns/fixed-and-flexible-size#using-flexible-column-sizing) for more details on the flex algorithm.

This can also be specified for all columns by specifying <PropLink name="columnMinWidth" />.

<Sandpack title="Controlled column sizing with minWidth for column">

```tsx file="columnSizing-example.page.tsx"

```

</Sandpack>
</Prop>

<Prop name="columnSizing.maxWidth" type="number">

> Specifies the maximum width for a column. Especially useful for flexible columns.

See [Using flexible column sizing](/docs/learn/columns/fixed-and-flexible-size#using-flexible-column-sizing) for more details on the flex algorithm.

This can also be specified for all columns by specifying <PropLink name="columnMaxWidth" />.

<Sandpack title="Controlled column sizing with maxWidth for column">

```tsx file="columnSizing-example.page.tsx"

```

</Sandpack>
</Prop>

<Prop name="columnSizing.width" type="number">

> Specifies the fixed width for the column.

See [Using flexible column sizing](/docs/learn/columns/fixed-and-flexible-size#using-flexible-column-sizing) for more details.

A column can either be flexible or fixed. For flexible columns, use <PropLink name="columnSizing.flex" />.

<Sandpack title="Controlled column sizing with fixed column">

```tsx file="columnSizing-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="keyboardShortcuts" type="{key,handler,when}[]">

> An array that specifies the keyboard shortcuts for the DataGrid.

See the [Keyboard Shortcuts](/docs/learn/keyboard-navigation/keyboard-shortcuts) page for more details.

<Sandpack>

<Description>
Click on a cell and use the keyboard to navigate.

Press `Shift+Enter` to show an alert with the current active cell position.

</Description>

```ts file="$DOCS/reference/keyboard-shortcuts-initial-example.page.tsx"
```
</Sandpack>


Infinite Table DataGrid comes with some predefined keyboard shorcuts.
you can import from the `keyboardShortcuts` named export.
```ts
import { keyboardShortcuts } from '@infinite-table/infinite-react'
```

#### Instant Edit

```ts {4,12}
import {
  DataSource,
  InfiniteTable,
  keyboardShortcuts
} from '@infinite-table/infinite-react';

 function App() {
  return <DataSource<Developer> primaryKey="id" data={dataSource}>
    <InfiniteTable<Developer>
      columns={columns}
      keyboardShortcuts={[
        keyboardShortcuts.instantEdit
      ]}
    />
  </DataSource>
}
```


<Note>

For now, the only predefined keyboard shorcut is `keyboardShortcuts.instantEdit`. This keyboard shorcut starts cell editing when any key is pressed on the active cell. This is the same behavior found in Excel/Google Sheets.

</Note>

<Sandpack>

<Description>

Click on a cell and then start typing to edit the cell.

</Description>

```ts file="$DOCS/reference/keyboard-shortcuts-instant-edit-example.page.tsx"
```
</Sandpack>

</Prop>

<Prop name="columnTypes" type="Record<string,InfiniteTableColumnType>">

> Specifies an object that maps column type ids to column types. Column types are used to apply the same configuration/properties to multiple columns. See related <PropLink name="columns.type" />

<Note>
By default, all columns have the `default` column type applied. So, if you define the `default` column type, but don't specify any <PropLink name="columns.type">type</PropLink> for a column, the default column type properties will be applied to that column.
</Note>

The following properties are currently supported for defining a column type:

- `align` - See <PropLink name="columns.align" />
- `components` - See <PropLink name="columns.components" />
- `cssEllipsis` - See <PropLink name="columns.cssEllipsis" />
- `defaultEditable` - See <PropLink name="columns.defaultEditable" />
- `defaultFlex` - default flex value (uncontrolled) for the column(s) this column type will be applied to. See <PropLink name="column.defaultFlex" />
- `defaultWidth` - default width (uncontrolled) for the column(s) this column type will be applied to. See <PropLink name="column.defaultWidth" />
- `getValueToEdit` - See <PropLink name="columns.getValueToEdit" />
- `getValueToPersist` - See <PropLink name="columns.getValueToPersist" />
- `headerAlign` - See <PropLink name="columns.headerAlign" />
- `headerCssEllipsis` - See <PropLink name="columns.headerCssEllipsis" />
- `headerStyle` - See <PropLink name="columns.headerStyle" />
- `header` - See <PropLink name="columns.header" />
- `maxWidth` - minimum width for the column(s) this column type will be applied to. See <PropLink name="column.maxWidth" />
- `minWidth` - minimum width for the column(s) this column type will be applied to. See <PropLink name="column.minWidth" />
- `renderMenuIcon` - See <PropLink name="columns.renderMenuIcon" />
- `renderSortIcon` - See <PropLink name="columns.renderSortIcon" />
- `renderValue` - See <PropLink name="columns.renderValue" />
- `render` - render function for the column(s) this column type will be applied to. See <PropLink name="column.render" />
- `shouldAcceptEdit` - See <PropLink name="columns.shouldAcceptEdit" />
- `sortable` - See <PropLink name="columns.sortable" />
- `style` - See <PropLink name="columns.style" />
- `valueFormatter` - See <PropLink name="columns.valueFormatter" />
- `valueGetter` - See <PropLink name="columns.valueGetter" />
- `verticalAlign` - See <PropLink name="columns.verticalAlign" />

<Note>
When any of the properties defined in a column type are also defined in a column (or in column sizing/pinning,etc), the later take precedence so the properties in column type are not applied.

The only exception to this rule is the <PropLink name="columns.components">components</PropLink> property, which is merged from column types into the column.
</Note>

<Sandpack size="lg" title="Using MUI X Date Picker with custom 'date' type columns" deps="@emotion/react,@emotion/styled,@mui/material,@mui/x-date-pickers,dayjs">

<Description>

This is a basic example integrating with the [MUI X Date Picker](https://mui.com/x/react-date-pickers/date-picker/) - click any cell in the **Birth Date** or **Date Hired** columns to show the date picker.

This example uses the <PropLink name="columnTypes" code={false}>column types</PropLink> to give each date column the same editor and styling.

</Description>

```ts file="$DOCS/learn/editing/column-types-date-editor-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="columnTypes.components">

> See related <PropLink name="columns.components" />.

</Prop>

<Prop name="columnTypes.defaultFlex" type="number" >

> Specifies a default flex value for the column type. Will be overriden in any column that already specifies a `defaultFlex` property.

See related <PropLink name="columnTypes.defaultWidth" />, <PropLink name="columns.defaultFlex" /> and <PropLink name="columns.defaultWidth" />

</Prop>

<Prop name="columnTypes.defaultSortable" type="boolean" >

> Specifies whether columns of this type are sortable.

This prop overrides the component-level <PropLink name="columnDefaultSortable" />.

This prop is overriden by <PropLink name="columns.defaultSortable" /> and <PropLink name="sortable" />.

</Prop>

<Prop name="columnTypes.headerClassName" type="string | (args) => string">

> Controls styling for the column header for columns with this column type. Can be a string or a function returning a string.

See docs at <PropLink name="columns.headerClassName" />.

</Prop>

<Prop name="columnTypes.headerStyle" type="CSSProperties | (args) => CSSProperties">

> Controls styling for the column header for columns with this column type. Can be a style object or a function returning a style object.

See docs at <PropLink name="columns.headerStyle" />.

</Prop>

<Prop name="columnTypes.defaultWidth" type="number" >

> Specifies a default fixed width for the column type. Will be overriden in any column that already specifies a `defaultWidth` property.

See related <PropLink name="columnTypes.defaultFlex" />, <PropLink name="columns.defaultWidth" /> and <PropLink name="columns.defaultFlex" />

</Prop>

<Prop name="columnTypes.maxWidth" type="number" >

> Specifies a default maximum width for the column type. Will be overriden in any column that already specifies a `maxWidth` property.

See related <PropLink name="columnTypes.maxWidth" /> and <PropLink name="columns.maxWidth" />

</Prop>

<Prop name="columnTypes.minWidth" type="number" >

> Specifies a default minimum width for the column type. Will be overriden in any column that already specifies a `minWidth` property.

See related <PropLink name="columnTypes.maxWidth" /> and <PropLink name="columns.minWidth" />

</Prop>

<Prop name="defaultActiveCellIndex" type="[number,number]">

> Specifies the active cell for keyboard navigation. This is an uncontrolled prop. See the [Keyboard Navigation](/docs/learn/keyboard-navigation/navigating-cells) page for more details.

See <PropLink name="activeCellIndex" /> for the controlled version of this prop and
<PropLink name="keyboardNavigation" /> for the keyboard navigation behavior.

<Sandpack title="Uncontrolled keyboard navigation for cells">

<Description>

This example starts with cell `[2,0]` already active.

</Description>

```ts file="$DOCS/learn/keyboard-navigation/navigating-cells-uncontrolled-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="columnsTypes.sortable" type="boolean">

> Specifies the sorting behavior for columns of this type.

Overrides the global <PropLink name="sortable" /> prop, but is overriden by the column's own <PropLink name="columns.sortable">sortable</PropLink> property.

</Prop>

<Prop name="defaultActiveRowIndex" type="number">

> Specifies the active row for keyboard navigation. This is an uncontrolled prop. See the [Keyboard Navigation](/docs/learn/keyboard-navigation/navigating-rows) page for more details.

See <PropLink name="activeRowIndex" /> for the controlled version of this prop and
<PropLink name="keyboardNavigation" /> for the keyboard navigation behavior.

<Sandpack title="Uncontrolled keyboard navigation for rows">

<Description>

This example starts with row at index `2` already active.

</Description>

```ts file="$DOCS/learn/keyboard-navigation/navigating-rows-uncontrolled-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="defaultColumnOrder" type="string[]|true" defaultValue={true}>

> Defines the order in which columns are displayed in the component.

For controlled usage, see <PropLink name="columnOrder" />.

When using this uncontrolled prop, you can also listen to <PropLink name="onColumnOrderChange" /> to be notified of column order changes

<Note>

The `defaultColumnOrder` array can contain identifiers that are not yet defined in the <PropLink name="columns" /> Map or can contain duplicate ids. This is a feature, not a bug. We want to allow you to use the `defaultColumnOrder` in a flexible way so it can define the order of current and future columns.

Displaying the same column twice is a perfectly valid use case.

</Note>

See [Column Order](/docs/learn/columns/column-order) for more details on ordering columns both programatically and via drag & drop.

<Sandpack title="Uncontrolled column order">

```ts file="defaultColumnOrder-example.page.tsx"

```

</Sandpack>
</Prop>

<Prop name="defaultColumnSizing" type="Record<string,{width,flex,...}>">

> Defines a default sizing of columns in the grid.

This is an uncontrolled property. For the controlled version and more details, see <PropLink name="columnSizing" />.

It is an object that maps column ids to column sizing options. The values in the objects can contain the following properties:

- <PropLink name="defaultColumnSizing.flex">flex</PropLink> - use this for flexible columns. Behaves like the `flex` CSS property.
- <PropLink name="defaultColumnSizing.width">width</PropLink> - use this for fixed sized columns
- <PropLink name="defaultColumnSizing.minWidth">minWidth</PropLink> - specifies the minimum width of the column. Useful for flexible columns or for restricting users resizing both fixed and flexible columns.
- <PropLink name="defaultColumnSizing.maxWidth">maxWidth</PropLink> - specifies the maximum width of the column. Useful for flexible columns or for restricting users resizing both fixed and flexible columns.

<Sandpack title="Uncontrolled column sizing">

```tsx file="defaultColumnSizing-example.page.tsx"

```

</Sandpack>

<Note>

For auto-sizing columns, see <PropLink name="autoSizeColumnsKey" />.

</Note>

</Prop>

<Prop name="defaultColumnSizing.flex" type="number">

> Specifies the flex value for the column.

See <PropLink name="columnSizing.flex" /> for details.

</Prop>

<Prop name="defaultColumnSizing.minWidth" type="number">

> Specifies the minimum width for a column. Especially useful for flexible columns.

See <PropLink name="columnSizing.minWidth" /> for details.

</Prop>

<Prop name="defaultColumnSizing.maxWidth" type="number">

> Specifies the maximum width for a column. Especially useful for flexible columns.

See <PropLink name="columnSizing.maxWidth" /> for details.

</Prop>

<Prop name="defaultColumnSizing.width" type="number">

> Specifies the fixed width for the column.

See <PropLink name="columnSizing.width" /> for details.

</Prop>

<Prop name="domProps" type="React.HTMLProps<HTMLDivElement>">

> DOM properties to be applied to the component root element.

For applying a className when the component is focused, see <PropLink name="focusedClassName" />

For applying a className when the focus is within the component, see <PropLink name="focusedWithinClassName" />

<Sandpack>

```ts file="domprops-example.page.tsx"

```

```ts file="data.ts"

```

</Sandpack>

</Prop>

<Prop name="editable" type="(param) => boolean | Promise<boolean>">

> Controls whether columns are editable or not.

This overrides both the global <PropLink name="columnDefaultEditable" /> prop and the column's own <PropLink name="columns.defaultEditable">defaultEditable</PropLink> property.

This function prop will be called when an edit is triggered on the column. The function will be called with a single object that contains the following properties:

- `value` - the current value of the cell (the value currently displayed, so after <PropLink name="columns.valueFormatter" /> and <PropLink name="columns.renderValue" /> have been applied)
- `rawValue` - the current value of the cell, but before any formatting and custom rendering has been applied. This is either the field value from the current data object, or the result of the column <PropLink name="columns.valueGetter">valueGetter</PropLink> function.
- `data` - the data object (of type `DATA_TYPE`) for the current row
- `rowInfo` - the row info object that underlies the row
- `column` - the current column on which editing is invoked
- `api` - a reference to the [InfiniteTable API](/docs/reference/api)
- `dataSourceApi` - - a reference to the [DataSource API](/docs/reference/datasource-api)

<Note>

The function can return a `boolean` value or a `Promise` that resolves to a `boolean` - this means you can asynchronously decide whether the cell is editable or not.

</Note>

</Prop>

<Prop name="focusedClassName" type="string">

> CSS class name to be applied to the component root element when it has focus.

For applying a className when the focus is within the component, see <PropLink name="focusedWithinClassName" />

For focus style, see <PropLink name="focusedStyle" />.

</Prop>

<Prop name="focusedWithinClassName" type="string">

> CSS class name to be applied to the component root element when there is focus within (inside) the component.

For applying a className when the component root element is focused, see <PropLink name="focusedClassName" />

</Prop>

<Prop name="focusedStyle">

> Specifies the `style` to be applied to the component root element when it has focus.

<Sandpack title="focusedStyle example">

```ts file="focusedStyle-example.page.tsx"

```

```ts file="data.ts"

```

</Sandpack>
</Prop>

<Prop name="focusedWithinStyle">

> Specifies the `style` to be applied to the component root element when there is focus within (inside) the component.

<Note>

To listen to focusWithin changes, listen to <PropLink name="onFocusWithin" /> and <PropLink name="onBlurWithin" />.

</Note>

<Sandpack title="focusedWithinStyle example - focus an input inside the table to see it in action">

```ts file="focusedWithinStyle-example.page.tsx"

```

```ts file="data.ts"

```

</Sandpack>

</Prop>

<Prop name="getCellContextMenuItems" type="({data, column, rowInfo}) => MenuItem[] | null | { items: MenuItem[], columns: [{name}] }">

> Customises the context menu items for a cell.

If you want to customize the context menu even when the user clicks outside any cell, but inside the table body, use <PropLink name="getContextMenuItems" />.

The `getCellContextMenuItems` function can return one of the following:

- `null` - no custom context menu will be displayed, the default context menu will be shown (default event behavior not prevented)
- `[]` - an empty array - no custom context menu will be displayed, but the default context menu is not shown - the default event behavior is prevented
- `Array<MenuItem>` - an array of menu items to be displayed in the context menu - each `MenuItem` should have:
  - a unique `key` property,
  - a `label` property with the value to display in the menu cell - it's called `label` because this is the name of the default column in the context menu
  - an optional `onAction({ key, item, hideMenu: () => void })` callback function to handle the click action on the menu item.
  - an optional `onClick(event)` callback function to handle the click event on the menu item.
  - an optional `hideMenuOnAction: boolean` - if `true`, it will close the context menu when the menu item is clicked

<Sandpack title="Using context menus">

```ts file="cell-basic-context-menu-example.page.tsx"

```

</Sandpack>

In addition, if you need to configure the context menu to have other columns rather than the default column (named `label`), you can do so by returning an object with `columns` and `items`:

```tsx
const getCellContextMenuItems = () => {
  return {
    columns: [{ name: 'Label' }, { name: 'Icon' }],
    items: [
      {
        label: 'Welcome',
        icon: '👋',
        key: 'hi',
      },
      {
        label: 'Convert',
        icon: '🔁',
        key: 'convert',
      },
    ],
  };
};
```

<Sandpack title="Customising columns in the context menu">

<Description>

Right-click any cell in the table to see a context menu with multiple columns (`icon`, `label` and `description`).

</Description>

```ts file="cells-with-custom-columns-context-menu-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="getContextMenuItems" type="({event, data?, column?, rowInfo}, {api, dataSourceApi}) => MenuItem[] | null | { items: MenuItem[], columns: [{name}] }">

> Customises the context menu items for the whole table.

If you want to customize the context menu only when the user clicks inside a cell, use <PropLink name="getCellContextMenuItems" />, which is probably what you're looking for.

The first argument this function is called with has the same shape as the one for <PropLink name="getCellContextMenuItems" /> but all cell-related properties could also be `undefined`. Also, the `event` is available as a property on this object.

If this function returns null, the default context menu of the browser will be shown (default event behavior not prevented).

<Sandpack title="Using context menus for the whole table">

```ts file="table-basic-context-menu-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="getColumnMenuItems" type="(items, context) => MenuItem[]">

> Allows customization of the context menu items for a column.

Use this function to customize the context menu for columns. The function is called with the following arguments:

- `items` - the default menu items for the column - you can return this array as is to use the default menu items (same as not providing this function prop) or you can customize the array or return a new one altogether.
- `context` - an object that gives you access to the column and the grid state
  - `context.column: InfiniteTableComputedColumn<T>` - the current column for which the context menu is being shown
  - `context.api` - a reference to the [api](./reference/api)

<Sandpack title="getColumnMenuItems example - custom menu item and icon">

<Description>

In this example, the currency and preferredLanguage columns have a custom icon for triggering the column context menu.

In addition, the `preferredLanguage` column has a custom header that shows a button for triggering the column context menu.

</Description>

```ts file="getColumnMenuItems-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="groupColumn" type="InfiniteTableColumn|(colInfo, toggleGroupRow) => InfiniteTableColumn">

> Allows you to define a custom configuration for one or multiple group columns. When this prop is defined, it gets merged onto any values specified in the <DPropLink name="groupBy.column" /> property.

If this is an object and no explicit <PropLink name="groupRenderStrategy" /> is specified, the component is rendered as if you had <PropLink name="groupRenderStrategy">groupRenderStrategy="single-column"</PropLink>.

If it's a function, it will be called with the following arguments:

- `colInfo` - an object with the following properties:
- `colInfo.groupCount` - the count of row groups
- `colInfo.groupBy` - the array of row groups, used by the `DataSource` to do the grouping
- `colInfo.groupRenderStrategy` - the current <PropLink name="groupRenderStrategy" code={false}>render strategy for groups</PropLink>.
- `colInfo.groupByForColumn` - the grouping object (one of the items in `colInfo.groupBy`) corresponding to the current column. Only defined when `groupRenderStrategy` is `multi-column`.
- `colInfo.groupIndexForColumn` - the index of `colInfo.groupByForColumn` in `colInfo.groupBy` - corresponding to the current column. Only defined when `groupRenderStrategy` is `multi-column`.
- `toggleGroupRow(groupKeys: any[])` - a function you can use to toggle a group row. Pass an array of keys - the path to the group row you want to toggle.

<Gotcha>

You can still use <PropLink name="groupColumn" /> as a function with single column group render strategy, but in this case, you have to be explicit and specify <PropLink name="groupRenderStrategy">groupRenderStrategy="single-column"</PropLink>.

</Gotcha>

<Sandpack title="groupColumn used as an object">

```ts file="group-column-custom-renderers-example.page.tsx"

```

</Sandpack>

<Sandpack title="groupColumn used as a function">

<Description>

This example shows how to use <PropLink name="groupColumn" /> as a function that allows you to customize all generated group columns in a single place.

</Description>

```ts file="group-column-custom-renderers-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="groupRenderStrategy" type="'single-column'|'multi-column'">

> Determines how grouping is rendered - whether a single or multiple columns are generated.

<Sandpack>

```ts file="groupRenderStrategy-example.page.tsx"

```

```ts file="employee-columns.ts"

```

</Sandpack>
</Prop>

<Prop name="hideColumnWhenGrouped" type="boolean" defaultValue={false}>

> Allows you to hide group columns bound to fields that are grouped by (fields mentioned in <DataSourcePropLink name="groupBy">groupBy.field</DataSourcePropLink>).

<Sandpack>

<Description>

In this example, toggle the checkbox to see the `stack` and `preferredLanguage` columns hide/show as the value of `hideColumnWhenGrouped` changes.

</Description>

```ts file="hideColumnWhenGrouped-example.page.tsx"

```

</Sandpack>
</Prop>

<Prop name="hideEmptyGroupColumns" type="boolean" defaultValue={false}>

> Allows you to hide group columns which don't render any information (this happens when all previous groups are collapsed).

<Sandpack>

```ts file="hideEmptyGroupColumns-example.page.tsx"

```

```ts file="employee-columns.ts"

```

</Sandpack>
</Prop>

<Prop name="keyboardNavigation" type="'cell'|'row'|false" defaultValue="'cell'">

> Determines whether keyboard navigation is enabled.

Available values:

- `'cell'` - enables keyboard navigation for cells. This is the default.
- `'row'` - enables keyboard navigation for rows.
- `false` - disables keyboard navigation.

For cell keyboard navigation, see <PropLink name="activeCellIndex" />.
For row keyboard navigation, see <PropLink name="activeRowIndex" />.

<Sandpack title="Keyboard navigation">

<Description>

This example starts with cell `[2,0]` already active.

</Description>

```ts file="$DOCS/learn/keyboard-navigation/navigating-cells-uncontrolled-example.page.tsx"

```

</Sandpack>

<Sandpack title="Disabled Keyboard navigation">

<Description>

In this example the keyboard navigation is disabled.

</Description>

```ts file="$DOCS/learn/keyboard-navigation/navigation-disabled-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="keyboardSelection" type="boolean" defaultValue={true}>

> Determines whether the keyboard can be used for selecting/deselecting rows/cells.

By default <PropLink name="keyboardSelection" /> is enabled, so you can use the keyboard **spacebar** key to select multiple rows. Using the spacebar key is equivalent to doing a mouse click, so expect the combination of **spacebar** + `cmd`/`ctrl`/`shift` modifier keys to behave just like clicking + the same modifier keys.

For specifying the selection mode, use <DPropLink name="selectionMode" />

<Sandpack  title="Toggling keyboard navigation">

```ts file="default-selection-mode-multi-row-keyboard-toggle-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="loadingText" type="ReactNode" defaultValue="'Loading'">

> The text inside the load mask - displayed when <DataSourcePropLink name="loading">loading=true</DataSourcePropLink>.

<Sandpack title="Customized loading text">

```ts file="loadingText-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="multiSortBehavior" type="'append'|'replace'" default="'replace'">

> Specifies the behavior of the DataGrid when [multiple sorting](/docs/learn/sorting/multiple-sorting) is configured. Defaults to `'replace'`.

When `InfiniteTable` is configured with multiple sorting there are two supported behaviors:

- `append` - when this behavior is used, clicking a column header adds that column to the alredy existing sort. If the column is already sorted, the sort direction is reversed. In order to remove a column from the sort, the user needs to click the column header in order to toggle sorting from ascending to descending and then to no sorting.
- `replace` - the default behavior - a user clicking a column header removes any existing sorting and sets that column as sorted. In order to add a new column to the sort, the user needs to hold the `Ctrl/Cmd` key while clicking the column header.

<Sandpack>
<Description>

Try clicking the `age` column and then the `firstName` column.

If the multi-sort behavior is `replace`, clicking the second column will remove the sort from the first column.
In order for the sorting to be additive, even if the behavior is `replace`, use the `Ctrl`/`Cmd` key while clicking the column header.

If the multi-sort behavior is `append`, clicking the second column will add it to the sort.

</Description>

```ts file="$DOCS/learn/sorting/local-multi-sorting-example-defaults-with-local-data.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="onActiveCellIndexChange" type="(activeCellIndex:[number,number])=>void">

> Callback triggered by cell navigation. See the [Keyboard Navigation](/docs/learn/keyboard-navigation/navigating-cells) page for more details.

See related <PropLink name="activeCellIndex" /> and <PropLink name="keyboardNavigation" /> for the keyboard navigation behavior.

<Sandpack title="Controlled keyboard navigation (for cells) with callback">

<Description>

This example uses `onActiveCellIndexChange` to react to changes in the `activeCellIndex`.

</Description>

```ts file="$DOCS/learn/keyboard-navigation/navigating-cells-controlled-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="onActiveRowIndexChange" type="(activeRowIndex:number)=>void">

> Callback triggered by row navigation. See the [Keyboard Navigation](/docs/learn/keyboard-navigation/navigating-rows) page for more details.

See related <PropLink name="activeRowIndex" /> and <PropLink name="keyboardNavigation" /> for the keyboard navigation behavior.

<Sandpack title="Controlled keyboard navigation (for rows) with callback">

<Description>

This example uses `onActiveRowIndexChange` to react to changes in the `activeRowIndex`.

</Description>

```ts file="$DOCS/learn/keyboard-navigation/navigating-rows-controlled-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="onBlurWithin" type="(event)=> void">

> Function that is called when a focused element is blurred within the component.

For the corresponding focus event, see <PropLink name="onFocusWithin" />

<Note>

This callback is fired when a focusable element inside the component is blurred, and the focus is no longer within the component. In other words, when you navigate focusable elements inside the table, this callback is not fired.

</Note>

<Sandpack title="Blur an input inside the table to see the callback fired">

```ts file="onBlurWithin-example.page.tsx"

```

```ts file="data.ts"

```

</Sandpack>
</Prop>

<Prop name="onCellClick" type="({ colIndex, rowIndex, column, columnApi, api, dataSourceApi }, event) => void">

> Callback function called when a cell has been clicked.

The first argument of the function is an object that contains the following properties:

- `rowIndex: number` - the index of the row that was clicked.
- `colIndex: number` - the index of the column that was clicked. This index is the index in the array of visible columns.
- `column: InfiniteTableComputedColumn<DATA_TYPE>` - the column that has been clicked
- `columnApi: InfiniteTableColumnApi<DATA_TYPE>` - the [column API](/docs/reference/column-api)
- `api: InfiniteTableApi<DATA_TYPE>` - a reference to the [API](docs/reference/api)
- `dataSourceApi: DataSourceApi<DATA_TYPE>` - a reference to the [Data Source API](/docs/reference/datasource-api). Can be used to get the current data.

The second argument is the original browser click event.

</Prop>

<Prop name="onColumnOrderChange" type="(columnOrder: string[])=>void">

> Called as a result of user changing the column order

</Prop>

<Prop name="onColumnSizingChange" type="(columnSizing)=>void">

> Called as a result of user doing a column resize.

Use this callback to get updated information after a column resize is performed.

This works well in combination with the controlled <PropLink name="columnSizing" /> prop (though you don't have to use controlled <PropLink name="columnSizing" /> in order to use this callback). For more info on resizing columns, see [Column Sizing](/docs/learn/columns/fixed-and-flexible-size).

See related <PropLink name="onViewportReservedWidthChange" />

<Sandpack title="Controlled column sizing example with onColumnSizingChange">

```ts file="onColumnSizingChange-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="onEditAccepted" type="({value, initialValue, column, rowInfo, ...}) => void">

> Callback prop called when an edit is accepted

In order to decide whether an edit should be accepted or not, you can use the global <PropLink name="shouldAcceptEdit"/> prop or the column-level <PropLink name="columns.shouldAcceptEdit">column.shouldAcceptEdit</PropLink> alternative.

<Note>

When neither the global <PropLink name="shouldAcceptEdit"/> nor the column-level <PropLink name="columns.shouldAcceptEdit">column.shouldAcceptEdit</PropLink> are defined, all edits are accepted by default.

</Note>

This callback is called with a single object that has the following properties:

- `value` - the value that was accepted for the edit operation.
- `initialValue` - the initial value of the cell (the value before editing started)
- `rowInfo` - of type <TypeLink name="InfiniteTableRowInfo" /> - the row info object that underlies the row
- `api` - a reference to the [InfiniteTable API](/docs/reference/api)
- `dataSouceApi` - a reference to the [DataSource API](/docs/reference/datasource-api)
- `column` - the column on which the edit was performed
- `columnApi` - a reference to the [column API](/docs/reference/column-api)

See related <PropLink name="onEditRejected" /> callback prop.

</Prop>

<Prop name="onEditPersistSuccess" type="({value, initialValue, column, rowInfo, ...})=>void">

> Callback prop called when an edit is persisted successfully

Has the same signature as <PropLink name="onEditAccepted" />

</Prop>

<Prop name="onEditRejected" type="({ value, initialValue, column, rowInfo, ... }) => void">

> Callback prop called when an edit is rejected

In order to decide whether an edit should be accepted or rejected, you can use the global <PropLink name="shouldAcceptEdit"/> prop or the column-level <PropLink name="columns.shouldAcceptEdit">column.shouldAcceptEdit</PropLink> alternative.

<Note>

When neither the global <PropLink name="shouldAcceptEdit"/> nor the column-level <PropLink name="columns.shouldAcceptEdit">column.shouldAcceptEdit</PropLink> are defined, all edits are accepted by default.

</Note>

This callback prop has almost the same signature as the <PropLink name="onEditAccepted" /> callback prop. The only difference is that the argument passed to the function also contains an `error` property, with a reference to the error that caused the edit to be rejected.

</Prop>

<Prop name="onFocusWithin" type="(event)=> void">

> Function that is called when the table receives focus within the component.

For the corresponding blur event, see <PropLink name="onBlurWithin" />

<Sandpack title="Focus an input inside the table to see the callback fired">

```ts file="onFocusWithin-example.page.tsx"

```

```ts file="data.ts"

```

</Sandpack>
</Prop>

<Prop name="onKeyDown" type="({ api, dataSourceApi }, event) => void">

> Callback function called when the `keydown` event occurs on the table.

The first argument of the function is an object that contains the following properties:

- `api: InfiniteTableApi<DATA_TYPE>` - a reference to the [API](docs/reference/api)
- `dataSourceApi: DataSourceApi<DATA_TYPE>` - a reference to the [Data Source API](/docs/reference/datasource-api). Can be used to get the current data.

The second argument is the original browser `keydown` event.

</Prop>

<Prop name="onReady" type="({api, dataSourceApi}) => void}">

> Callback prop that is being called when the table is ready.

This is called only once with an object that has an `api` property, which is an instance of [`InfiniteTableApi<DATA_TYPE>`](/docs/reference/api) and a `dataSourceApi` property, which is an instance of [`DataSourceApi<DATA_TYPE>`](/docs/reference/datasource-api).

The `ready` state for the table means it has been layout out and has measured its available size for laying out the columns.

It will never be called again after the component is ready.

</Prop>

<Prop name="onRenderRangeChange" type="(range)=>void">
> Called whenever the render range changes, that is, additional rows or columns come into view.

The first (and only) argument is an object with `{start, end}` where both `start` and `end` are arrays of `[rowIndex, colIndex]` pairs.

 So if you want to get the start and end indexes, you can do

 ```ts
 const [startRow, startCol] = renderRange.start;
 const [endRow, endCol] = renderRange.end;
 ```

<Note>

This callback is not debounced or throttled, so it can be called multiple times in a short period of time, especially while scrolling. Make sure your function is fast, or attach a debounced function, in order to avoid performance issues.

```tsx
import {
  debounce,
  InfiniteTable,
  DataSource
} from '@infinite-table/infinite-react';

function App() {
  const onRenderRangeChange = useMemo(() => {
    return debounce((range) => {
      console.log(range.start, range.end);
    }, {wait: 100});
  }, []);

  return <DataSource<Developer>
    primaryKey="id"
    data={/*data*/}
  >
    <InfiniteTable<Developer>
      onRenderRangeChange={onRenderRangeChange}
      columns={/*columns*/}
    />
  </DataSource>
}
```
</Note>

Unlike <PropLink name="onScrollStop" />, this function is also called when the DataGrid is resized and also when initially rendered.

</Prop>


<Prop name="onScrollStop" type="({renderRange, viewportSize, scrollTop, scrollLeft})=>void">

> Triggered when the user has stopped scrolling (after <PropLink name="scrollStopDelay" /> milliseconds).

This is called when the user stops scrolling for a period of time - as configured by <PropLink name="scrollStopDelay" /> (milliseconds).

The function is called with an object that has the following properties:
 - `renderRange` - the render range of the viewport. This is an object with `{start, end}` where both `start` and `end` are arrays of `[rowIndex, colIndex]` pairs.
 So if you want to get the start and end indexes, you can do
 ```ts
 const [startRow, startCol] = renderRange.start;
 const [endRow, endCol] = renderRange.end;
 ```

 - `viewportSize` - the size of the viewport - `{width, height}`
 - `scrollTop` - the scrollTop position of the viewport - `number`
 - `scrollLeft` - the scrollLeft position of the viewport - `number`


Also see <PropLink name="onScrollToTop" />, <PropLink name="onScrollToBottom" /> and <PropLink name="onRenderRangeChange" />.

<Sandpack title="onScrollStop is called with viewport info - scroll the grid and see the console" >

```ts file="./onScrollStop-example.page.tsx"

```

</Sandpack>
</Prop>

<Prop name="onScrollToBottom" type="()=>void">

> Triggered when the user has scrolled to the bottom of the component. Also see <PropLink name="onScrollToTop" /> and <PropLink name="onScrollStop" />.

Also see <PropLink name="onScrollToTop" /> and <PropLink name="onScrollStop" />.

As an example usage, we're demoing live pagination, done in combination with the [react-query](https://react-query.tanstack.com/) library.

<Note>

If you want to scroll to the top of the table, you can use the <PropLink name="scrollTopKey" /> prop.

</Note>

<Sandpack title="Fetch new data on scroll to bottom" deps="react-query">

```ts file="$DOCS/learn/working-with-data/live-pagination-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="onViewportReservedWidthChange" type="(reserved: number) => void">

> Callback to be notified of changes to <PropLink name="viewportReservedWidth" />

See <PropLink name="viewportReservedWidth" /> for details. See related <PropLink name="onColumnSizingChange" />.

When he user is performing a column resize (via drag & drop), <PropLink name="onViewportReservedWidthChange" /> is called when the resize is finished (not the case for resizing with the **SHIFT** key pressed, when adjacent columns share the space between them since the reserved width is preserved).

<Sandpack title="Using onViewportReservedWidth to respond to user column resizing">

<Description>
Resize a column to see `viewportReservedWidth` updated and then click the button to reset it to `0px`
</Description>

```ts file="viewportReservedWidth-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="persistEdit" type="(params) => any|Error|Promise<any|Error>">

> Custom function to persist an edit

This allows edits that have been accepted (see <PropLink name="shouldAcceptEdit" />) to be persisted to a remote (or local) location.

This function is called with an object that has the following properties:

- `value` - the value that was accepted for the edit operation.
- `initialValue` - the initial value of the cell (the value that was displayed before editing started). This is the value resulting after <PropLink name="columns.valueFormatter" /> and <PropLink name="columns.renderValue" /> have been applied)
- `rawValue` - the initial value of the cell, but before any formatting and custom rendering has been applied. This is either the field value from the current data object, or the result of the column <PropLink name="columns.valueGetter">valueGetter</PropLink> function.
- `data` - the current data object
- `rowInfo` - the row info object that underlies the row
- `column` - the current column on which editing is invoked
- `api` - a reference to the [InfiniteTable API](/docs/reference/api)
- `dataSourceApi` - - a reference to the [DataSource API](/docs/reference/datasource-api)

<Note>

This function can be synchronous or asynchronous. For synchronous persisting, return an `Error` if the persisting fails, or any other value if all went well.

For asynchronous persisting, you have to return a `Promise`. If the persisting fails, resolve the promise with an `Error` object or reject the promise. If the persisting succeeded, resolve the promise with any non-error value.

</Note>

</Prop>

<Prop name="pivotGrandTotalColumnPosition" defaultValue={false} type={'"start"|"end"|false'}>

> Controls the position and visibility of pivot grand-total columns

If specified as `false`, the pivot grand-total columns are not displayed.

For normal pivot total columns, see <PropLink name="pivotTotalColumnPosition"/>.

<Sandpack title="Pivoting with pivotGrandTotalColumnPosition=start">

```ts file="pivot-grand-total-column-position-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="pivotTotalColumnPosition" defaultValue={'"end"'} type={'"start"|"end"|false'}>

> Controls the position and visibility of pivot total columns

If specified as `false`, the pivot total columns are not displayed.

For grand-total pivot columns, see <PropLink name="pivotGrandTotalColumnPosition"/>.

<Note>

Pivot total columns only make sense when pivoting by two or more pivot fields, and thus will only display if this is the case. You can however, display grand-total columns if you have a single pivot field (or even no pivot fields - so <DataSourcePropLink name="pivotBy"/> is an empty array).

In case there are no pivot fields, but <DataSourcePropLink name="pivotBy"/> is an empty array, by default, a total column will be displayed for each aggregation (unless you specify <PropLink name="pivotTotalColumnPosition"/> as `false`).

</Note>

<Sandpack title="Pivoting with pivotTotalColumnPosition=start">

```ts file="pivot-total-column-position-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="resizableColumns" type="boolean" defaultValue={true}>

> Controls if by default all columns are resizable or not.

This property controls the behavior for all columns that don't have <PropLink name="columns.resizable" /> explicitly specified.

<Sandpack title="Resizable columns example">

<Description>
For resizable columns, hover the mouse between column headers to grab & drag the resize handle.

Hold SHIFT when grabbing in order to **share space on resize**.
</Description>

```ts file="resizableColumns-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="rowHeight" type="number|string" defaultValue={40}>

> Specifies the height for rows. If a string is passed, it should be the name of a CSS variable, eg `--row-height`

<Sandpack title="rowHeight as number">

```ts file="rowHeight-number-example.page.tsx"

```

```ts file="data.ts"

```

</Sandpack>

<Sandpack title="rowHeight from CSS variable name">

```ts file="rowHeight-cssvar-example.page.tsx"

```

```ts file="data.ts"

```

</Sandpack>

</Prop>

<Prop name="rowClassName" type="string|(params:InfiniteTableStylingFnParams) => string">

> Specifies the className to be applied to all rows or conditionally to certain rows.

The `rowClassName` prop can be either a string or a function that returns a string.

When used as a function, it's called with a param of type <TypeLink name="InfiniteTableStylingFnParams" />, just like the <PropLink name="rowStyle" /> function.

</Prop>

<Prop name="rowStyle" type="CSSProperties|(params:InfiniteTableStylingFnParams) => CSSProperties">

> Specifies the style object to be applied to all rows or conditionally to certain rows.

The `rowStyle` prop can be either an object (typed as `React.CSSProperties`) or a function that is called with a param of type <TypeLink name="InfiniteTableStylingFnParams" />

### `rowStyle` as a function

When `rowStyle` is a function, it's called with a param of type <TypeLink name="InfiniteTableStylingFnParams" />

When Infinite Table calls `rowStyle`, the `data` property can be null - this is the case for grouped rows.

The `rowInfo` object contains the following properties (see <TypeLink name="InfiniteTableRowInfo" >type definition here</TypeLink>):

- `id` - the id of the current row
- `data` - the data object
- `indexInAll` - the index in the whole dataset
- `indexInGroup` - the index of the row in the current group
- `groupBy` - the fields used to group the `DataSource`
- `isGroupRow` - whether the row is a group row
- `collapsed` - for a group row, whether the group row is collapsed

See [Using RowInfo](/docs/learn/rows/using-row-info) for more details.

You can either return a valid style object, or undefined.

```tsx
const rowStyle: InfiniteTablePropRowStyle<Employee> = ({
  data,
  rowInfo,
}: {
  data: Employee | null;
  rowInfo: InfiniteTableRowInfo<Employee>;
}) => {
  const salary = data ? data.salary : 0;

  if (salary > 150_000) {
    return { background: 'tomato' };
  }
  if (rowInfo.indexInAll % 10 === 0) {
    return { background: 'lightblue', color: 'black' };
  }
};
```

<Sandpack title="rowStyle example usage">

```ts file="rowStyle-example.page.tsx"

```

```ts file="rowStyle-example-columns.ts"

```

</Sandpack>

</Prop>

<Prop name="viewportReservedWidth" type="number" defaultValue={0}>

> Specifies the width of the space to be kept as blank - useful when there are flex columns. This number can even be negative.

The flexbox algorithm also uses `viewportReservedWidth` to determine the width of the viewport to use for sizing columns - you can use `viewportReservedWidth=100` to always have a `100px` reserved area that won't be used for flexing columns.

Or you can use a negative value, eg `-200` so the flexbox algorithm will use another `200px` (in addition to the available viewport area) for sizing flexible columns - this will result in a horizontal scrollbar being visible.

For reacting to column resizing, you need to listen to <PropLink name="onViewportReservedWidthChange" />

<Sandpack title="Using viewportReservedWidth to reserve whitespace when you have flexible columns">

<Description>
Resize a column to see `viewportReservedWidth` updated and then click the button to reset it to `0px`
</Description>

```ts file="viewportReservedWidth-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="shouldAcceptEdit" type="(params) => boolean|Error|Promise<boolean|Error>">

> Function used to validate edits for all columns.

This function is called when the user wants to finish an edit - it is used to decide whether an edit is accepted or rejected, for all columns.

<p>This overrides the column-level <PropLink name="columns.shouldAcceptEdit">column.shouldAcceptEdit</PropLink> prop.</p>
<p>If you define the global <PropLink name="shouldAcceptEdit" /> and still want to use the column-level <PropLink name="columns.shouldAcceptEdit">column.shouldAcceptEdit</PropLink>, you can call the column-level function from this global one.</p>

The function is called with an object that has the following properties:

- `value` - the value that the user wants to persist via the cell editor
- `initialValue` - the initial value of the cell (the value that was displayed before editing started). This is the value resulting after <PropLink name="columns.valueFormatter" /> and <PropLink name="columns.renderValue" /> have been applied)
- `rawValue` - the initial value of the cell, but before any formatting and custom rendering has been applied. This is either the field value from the current data object, or the result of the column <PropLink name="columns.valueGetter">valueGetter</PropLink> function.
- `data` - the current data object
- `rowInfo` - the row info object that underlies the row
- `column` - the current column on which editing is invoked
- `api` - a reference to the [InfiniteTable API](/docs/reference/api)
- `dataSourceApi` - - a reference to the [DataSource API](/docs/reference/datasource-api)

<Sandpack>

<Description>

Edit the `salary` column. Only valid numbers are persisted.

</Description>

```ts file="global-should-accept-edit-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="scrollTopKey" type="number|string">

> Determines scrolling the table to the top.

Use this property to declaratively tell the `InfiniteTable` component to scroll to the top. Whenever a new value is provided for this property, it will scroll to the top.

<Sandpack title="Declaratively scrolling to the top of the table">

```ts file="scrollTopKey-example.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="virtualizeColumns" type="boolean" defaultValue={true}>

> Configures whether columns are virtualized or not

By default, columns are virtualized in order to improve performance.

</Prop>

</PropTable>
