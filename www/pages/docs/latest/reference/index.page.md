---
title: Infinite Table Reference
layout: API
---

In the API Reference below we'll use **`DATA_TYPE`** to refer to the TypeScript type that represents the data the component is bound to.


<PropTable>

<Prop name="activeCellIndex" type="[number,number] | null">

> Specifies the active cell for keyboard navigation. This is a controlled prop. See the [Keyboard Navigation](/docs/latest/learn/keyboard-navigation/navigating-cells) page for more details.

See <PropLink name="defaultActiveCellIndex" /> for the uncontrolled version of this prop and <PropLink name="keyboardNavigation" /> for the keyboard navigation behavior.

Use the <PropLink name="onActiveCellIndexChange" /> callback to be notified when the active cell changes.

`null` is a valid value, and it means no cell is currently rendered as active. Especially useful for controlled scenarios, when you need ultimate control over the behavior of keyboard navigation.

<Sandpack title="Controlled keyboard navigation for cells">

<Description>

This example starts with cell `[2,0]` already active.

</Description>

```ts file=../learn/keyboard-navigation/navigating-cells-controlled-example.page.tsx
```

</Sandpack>

</Prop>


<Prop name="activeRowIndex" type="number | null">

> Specifies the active row for keyboard navigation. This is a controlled prop. See the [Keyboard Navigation](/docs/latest/learn/keyboard-navigation/navigating-rows) page for more details.

See <PropLink name="defaultActiveRowIndex" /> for the uncontrolled version of this prop and <PropLink name="keyboardNavigation" /> for the keyboard navigation behavior.

Use the <PropLink name="onActiveRowIndexChange" /> callback to be notified when the active row changes.

`null` is a valid value, and it means no row is currently rendered as active. Especially useful for controlled scenarios, when you need ultimate control over the behavior of keyboard navigation.

<Sandpack title="Controlled keyboard navigation for rows">

<Description>

This example starts with row at index `2` already active.

</Description>

```ts file=../learn/keyboard-navigation/navigating-rows-controlled-example.page.tsx
```

</Sandpack>

</Prop>


<Prop name="autoSizeColumnsKey" type="number|string|{key,includeHeader,columnsToSkip,columnsToResize}">

> Controls auto-sizing of columns.

Here is a list of possible values for `autoSizeColumnsKey`:

- `string` or `number` - when the value is changing, all columns will be auto-sized.

- an object with a `key` property (of type `string` or `number`) - whenever the `key` changes, the columns will be auto-sized. Specifying an object for `autoSizeColumnsKey` gives you more control over which columns are auto-sized and if the size measurements include the header or not.

When an object is used, the following properties are available:

 * `key` - mandatory property, which, when changed, triggers the update
 * `includeHeader` - optional boolean, - decides whether the header will be included in the auto-sizing calculations. If not specified, `true` is assumed.
 * `columnsToSkip` - a list of column ids to skip from auto-sizing. If this is used, all columns except those in the list will be auto-sized.
 * `columnsToResize` - the list of column ids to include in auto-sizing. If this is used, only columns in the list will be auto-sized.


<Sandpack title="Auto-sizing columns">

```tsx file=autoSizeColumnsKey-example.page.tsx
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

<Prop name="columnDefaultWidth" type="number" defaultValue={200}>

> Specifies the a default width for all columns.

<Note>

If a column is explicitly sized via <PropLink name="columns.defaultWidth">column.defaultWidth</PropLink>, <PropLink name="columns.defaultFlex">column.defaultFlex</PropLink>, <PropLink name="columnSizing.width" /> (or <PropLink name="defaultColumnSizing.width" />), that will be used instead.

</Note>

Use <PropLink name="columnMinWidth" /> to set a minimum width for all columns.
Use <PropLink name="columnMaxWidth" /> to set a maximum width for all columns.

<PropLink name="columnMinWidth" /> and <PropLink name="columnMaxWidth" /> will be very useful once flex column sizing lands.

<Sandpack>

```ts file=columnDefaultWidth-example.page.tsx
```
```ts file=data.ts
```

</Sandpack>
</Prop>


<Prop name="columnMaxWidth" type="number" defaultValue={2000}>

> Specifies the maximum width for all columns.


For specifying the minimum column width, see <PropLink name="columnMinWidth" />.

Maximum column width can be controlled more granularly via <PropLink name="columnSizing.maxWidth" />, on a per column level.


<Sandpack>

```tsx file=columnMaxWidth-example.page.tsx
```

</Sandpack>

</Prop>

<Prop name="columnMinWidth" type="number" defaultValue={30}>

> Specifies the minimum width for all columns.


For specifying the maximum column width, see <PropLink name="columnMaxWidth" />.

Minimum column width can be controlled more granularly via <PropLink name="columnSizing.minWidth" /> or <PropLink name="columns.minWidth" />, on a per column level.

<Sandpack>

```tsx file=columnMinWidth-example.page.tsx
```

</Sandpack>

</Prop>


<Prop name="columnOrder" type="string[]|true">>

> Defines the order in which columns are displayed in the component

For uncontrolled usage, see <PropLink name="defaultColumnOrder" />.

When using this controlled prop, make sure you also listen to <PropLink name="onColumnOrderChange" />

See [Column Order](/docs/latest/learn/columns/column-order) for more details on ordering columns both programatically and via drag & drop.

<Note>

The `columnOrder` array can contain identifiers that are not yet defined in the <PropLink name="columns" /> Map or can contain duplicate ids. This is a feature, not a bug. We want to allow you to use the `columnOrder` in a flexible way so it can define the order of current and future columns.

Displaying the same column twice is a perfectly valid use case.

</Note>


<Sandpack title="Column order">

```ts file=columnOrder-example.page.tsx
```

</Sandpack>

This prop can either be an array of strings (column ids) or the boolean `true`. When `true`, all columns present in the <PropLink name="columns" /> object will be displayed, in the iteration order of the object keys.

<Sandpack title="Column order advanced example">

```ts file=columnOrder-advanced-example.page.tsx
```

</Sandpack>

<Note>

Using <PropLink name="columnOrder" /> in combination with <PropLink name="columnVisibility" /> is very powerful - for example, you can have a specific column order even for columns which are not visible at a certain moment, so when they will be made visible, you'll know exactly where they will be displayed.

</Note>


</Prop>

<Prop name="columns" type="Record<string, InfiniteTableColumn<DATA_TYPE>>">

> Describes the columns available in the component.

The following properties are available:

 * <PropLink name="columns.field">field</PropLink>
 * <PropLink name="columns.defaultWidth">defaultWidth</PropLink>
 * <PropLink name="columns.defaultFlex">defaultFlex</PropLink>
 * render
 * renderValue
 * type
 * <PropLink name="columns.header">header</PropLink>
 * ...etc

<Sandpack>

```ts file=columns-example.page.tsx
```
```ts file=data.ts
```

</Sandpack>
</Prop>

<Prop name="columns.components">

> Specifies custom React components to use for column cells or header

The column components object can have either of the two following properties:

 * <PropLink name="columns.components.ColumnCell">ColumnCell</PropLink> - a React component to use for rendering the column cells
 * <PropLink name="columns.components.HeaderCell">HeaderCell</PropLink> - a React component to use for rendering the column header

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
<div ref={domRef}>
  ...
</div>
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

```tsx {4,8}
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
  )
}

```

</Note>


<Sandpack title="Custom components">

```tsx file=column-components-example.page.tsx

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
<div ref={domRef}>
  ...
</div>
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

```tsx {4,8}
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
}

```

</Note>


<Sandpack title="Custom components">

```tsx file=column-components-example.page.tsx

```

</Sandpack>

</Prop>

<Prop name="columns.cssEllipsis" type="boolean" defaultValue={true}>

> Specifies if the column should show ellipsis for content that is too long and does not fit the column width.

<Note>

For header ellipsis, see related <PropLink name="headerCssEllipsis" />.

</Note>


<Sandpack title="First name column(first) has cssEllipsis set to false">


```ts file=columns-cssEllipsis-example.page.tsx
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


<Prop name="columns.defaultHiddenWhenGroupedBy" type="'*'| keyof DATA_TYPE | { [keyof DATA_TYPE]: true }">

> Controls default column visibility when <DataSourcePropLink name="groupBy" /> is used.

This property does not apply (work) when controlled <PropLink name="columnVisibility"  /> is used, it only works with uncontrolled column visibility.

The value for this property can be one of the following:
 * the `'*'` string - this means, the column is hidden whenever there are groups - so any groups.
 * a `string`, namely a field from the bound type of the `DataSource` (so type is `keyof DATA_TYPE`) - the column is hidden whenever there is grouping that includes the specified field. The grouping can contain any other fields, but if it includes the specified field, the column is hidden.
 * `an object with keys` of type `keyof DATA_TYPE` and values being `true` - whenever the grouping includes any of the fields that are in the keys of this object, the column is hidden.


<Sandpack>

```ts file=columnDefaultHiddenWhenGroupedBy-example.page.tsx
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

```ts file=columns-example.page.tsx
```
```ts file=data.ts
```

</Sandpack>
</Prop>

<Prop name="columns.header" type="React.ReactNode|({column, columnSortInfo})=>React.ReactNode">

> Specifies the column header. Can be a static value or a function that returns a React node.

<Note>

If no `header` is specified for a column, the <PropLink name="columns.field">field</PropLink> will be used instead.

</Note>

If a function is provided, it will be called with an argument with the following properties:

 * `column`
 * `columnSortInfo` - will allow you to render custom header based on the sort state of the column.

When we implement filtering, you'll also have access to the column filter.

<Note>

For styling the column header, you can use <PropLink name="columns.headerStyle">headerStyle</PropLink> or <PropLink name="columns.headerClassName">headerClassName</PropLink>.

</Note>


<Sandpack>

```ts file=columns-header-example.page.tsx
```
```ts file=data.ts
```

</Sandpack>

<Note>

In the `column.header` function you can use hooks or <PropLink name="columns.components.HeaderCell" nocode>render custom React components via column.components.HeaderCell</PropLink>. To make it easier to access the param of the `header` function, we've exposed the <HookLink name="useInfiniteHeaderCell" /> - use it to gain access to the same object that is passed as an argument to the `header` function.

</Note>

<Sandpack title="Column with custom header that uses useInfiniteHeaderCell">

```ts file=column-header-hooks-example.page.tsx
```

</Sandpack>  

</Prop>

<Prop name="columns.headerClassName" type="string | (args) => string">

> Controls the css class name for the column header. Can be a string or a function returning a string.

If defined as a function, it accepts an object as a parameter, which has the following properties:

 * `column` - the current column where the style is being applied
 * `columnSortInfo` - the sorting information for the column
 * `columnFilterValue` - the filtering information for the column
 * `dragging` - whether the current column is being dragged at the current time (during a column reorder)
 
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


```ts file=columns-cssEllipsis-example.page.tsx
```

</Sandpack>

</Prop>

<Prop name="columns.headerStyle" type="CSSProperties | (args) => CSSProperties">

> Controls styling for the column header. Can be a style object or a function returning a style object.

If defined as a function, it accepts an object as a parameter, which has the following properties:

 * `column` - the current column where the style is being applied
 * `columnSortInfo` - the sorting information for the column
 * `columnFilterValue` - the filtering information for the column
 * `dragging` - whether the current column is being dragged at the current time (during a column reorder)
 
<Note>

The `headerStyle` property can also be specified for <PropLink name="columnTypes.headerStyle">columnTypes</PropLink>.

For styling with CSS, see <PropLink name="columns.headerClassName" />.

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



<Prop name="columns.render" type="({ value, data, rowInfo, column, rowIndex, pivotBy, groupBy, toggleCurrentGroupRow}) => Renderable">

> Customizes the rendering of the column.

See related <PropLink name="columns.renderValue" />

<Note>

The difference between <PropLink name="columns.render"/> and  <PropLink name="columns.renderValue"/>  is only for special columns (for now, only group columns are special columns, but more will come) when `InfiniteTable` renders additional content inside the column (eg: collapse/expand tool for group rows). The <PropLink name="columns.render"/> function allows you to override the additional content. So if you specify this function, it's up to you to render whatever content, including the collapse/expand tool.


Note that for customizing the collapse/expand tool, you can use specify `renderGroupIcon` function on the group column.

</Note>


The <PropLink name="columns.render">render</PropLink> and <PropLink name="columns.renderValue">renderValue</PropLink> functions are called with an object that has the following properties:

 * data - the data object (of type `DATA_TYPE | Partial<DATA_TYPE> | null`) for the row.
 * rowInfo - very useful information about the current row. See [Using RowInfo](/docs/latest/learn/rows/using-row-info) for more details.


<Sandpack title="Column with custom render">

```ts file=column-render-example.page.tsx
```

</Sandpack>  

<Note>

In the `column.render` function you can use hooks or <PropLink name="columns.components.ColumnCell" nocode>render custom React components</PropLink>. To make it easier to access the param of the `render` function, we've exposed the <HookLink name="useInfiniteColumnCell" /> - use it to gain access to the same object that is passed as an argument to the `render` function.


</Note>

<Sandpack title="Column with custom render that uses useInfiniteColumnCell">

```ts file=column-render-hooks-example.page.tsx
```

</Sandpack>  


</Prop>


<Prop name="columns.renderValue" type="({ value, data, rowInfo, column, rowIndex, pivotBy, groupBy,toggleCurrentGroupRow}) => Renderable">

> Customizes the rendering of the column content.

See related <PropLink name="columns.render" />

<Note>

The difference between <PropLink name="columns.renderValue"/> and <PropLink name="columns.render"/> is only for special columns (for now, only group columns are special columns, but more will come) when `InfiniteTable` renders additional content inside the column (eg: collapse/expand tool for group rows). The <PropLink name="columns.render"/> function allows you to override the additional content. So if you specify this function, it's up to you to render whatever content, including the collapse/expand tool.


Note that for customizing the collapse/expand tool, you can use specify `renderGroupIcon` function on the group column.

</Note>


The <PropLink name="columns.renderValue">renderValue</PropLink> and <PropLink name="columns.renderValue">render</PropLink> functions are called with an object that has the following properties:

 * data - the data object (of type `DATA_TYPE | Partial<DATA_TYPE> | null`) for the row.
 * rowInfo - very useful information about the current row. See [Using RowInfo](/docs/latest/learn/rows/using-row-info) for more details.

<Sandpack title="Column with custom renderValue">

```tsx file=column-renderValue-example.page.tsx
```
</Sandpack>


<Note>

In the `column.renderValue` function you can use hooks or <PropLink name="columns.components.ColumnCell" nocode>render custom React components</PropLink>. To make it easier to access the param of the `renderValue` function, we've exposed the <HookLink name="useInfiniteColumnCell" /> - use it to gain access to the same object that is passed as an argument to the `renderValue` function.


</Note>
</Prop>

<Prop name="columns.resizable" type="boolean">

> Specifies if the current column is resizable or not.

By default, all columns are resizable, since <PropLink name="resizableColumns" /> defaults to `true`.

</Prop>

<Prop name="columns.rowspan" type="({ rowInfo, data, rowIndex, column }) => number">

> Specifies the rowspan for cells on the current column.

The default rowspan for a column cell is 1. If you want to span multiple rows, return a value that is greater than 1.

This function is called with an object that has the following properties:

* column - the current column
* data - the current data
* rowInfo - information about the current row

The `rowInfo` object contains information about grouping (if this row is a group row, the collapsed state, etc), parent groups, children of the current row (if it's a row group), etc. See [Using RowInfo](/docs/latest/learn/rows/using-row-info) for more details.

<Sandpack>

```ts file=column-rowspan-example.page.tsx
```

</Sandpack>

</Prop>

<Prop name="columns.sortType" type="string" defaultValue="'string'">

> Specifies the sort type for the column. See related <DataSourcePropLink name="sortTypes" />

For local sorting, the sort order for a column is determined by the specified `sortType`. If no `sortType` is specified, the <PropLink name="columns.dataType">column.dataType</PropLink> will be used as the `sortType`. If no `sortType` or `dataType` is specified, `"string"` is used.

<Sandpack  title="Custom sort by color - magenta will come first">

```ts file=./datasource-props/sortTypes-example.page.tsx
```

</Sandpack>

</Prop>

<Prop name="columns.style" type="CSSProperties | (args) => CSSProperties">

> Controls styling for the column. Can be a style object or a function returning a style object.

If defined as a function, it accepts an object as a parameter, which has the following properties:

 * `column` - the current column where the style is being applied
 * `data` - the data object for the current row. The type of this object is `DATA_TYPE | Partial<DATA_TYPE> | null`. For regular rows, it will be of type `DATA_TYPE`, while for group rows it will be `Partial<DATA_TYPE>`. For rows not yet loaded (because of batching being used), it will be `null`.
 * `rowInfo` - the information about the current row - see [Using RowInfo](/docs/latest/learn/rows/using-row-info) for more details.
 * `value` - the underlying value of the current cell - will generally be `data[column.field]`, if the column is bound to a `field` property



<Note>

The `style` property can also be specified for <PropLink name="columnTypes"/>


</Note>

<Sandpack>

```ts file=columns-style-example.page.tsx
```

</Sandpack>


</Prop>

<Prop name="columns.type" type="string | string[]" defaultValue="'default'">

> Specifies the column type - a column type is a set of properties that describes the column. Column types allow to easily apply the same properties to multiple columns.


<Note>

Specifying `type: "number"` for numeric columns will ensure correct number sorting function is used (when sorting is done client-side).

</Note>

See <PropLink name="columnTypes"/> for more details on using column types.


<Note>

By default, all columns have the `default` column type applied. So, if you define the `default` column type, but don't specify any <PropLink name="columns.type">type</PropLink> for a column, the default column type properties will be applied to that column.

</Note>

<Note>

When you want both the default type and another type to be applied, you can do so by specifying `type: ["default", "second-type"]`.

When you dont want the default type to be applied, use  `type: null`.

</Note>

See the example below - `id` and `age` columns are `type='number'`.

<Sandpack>

```ts file=columns-example.page.tsx
```
```ts file=data.ts
```

</Sandpack>
</Prop>

<Prop name="columns.valueGetter" type="({ data, rowInfo }) => string | number | boolean | null | undefined">

> Customizes the value that will be rendered

The `valueGetter` prop is a function that takes a single argument - an object with `data` and `rowInfo` properties. It should return a plain JavaScript value (so not a `ReactNode` or `JSX.Element`)

<Note>

Note that the `data` property is of type `DATA_TYPE | Partial<DATA_TYPE> | null` and not simply `DATA_TYPE`, because there are cases when you can have grouping (so for group rows with aggregations `data` will be `Partial<DATA_TYPE>`) or when there are lazily loaded rows or group rows with no aggregations - for which `data` is still `null`.

</Note>


If you want to further customize what's being rendered, see <PropLink name="columns.renderValue" />.

<Sandpack title="Column with custom valueGetter">

```tsx file=column-valueGetter-example.page.tsx
```
</Sandpack>

</Prop>

<Prop name="columnSizing" type="Record<string,{width,flex,...}>">

> Defines the sizing of columns in the grid.

This is a controlled property. For the uncontrolled version, see <PropLink name="defaultColumnSizing" />.

It is an object that maps column ids to column sizing options. The values in the objects can contain the following properties:
 * <PropLink name="columnSizing.flex">flex</PropLink> - use this for flexible columns. Behaves like the `flex` CSS property.
 * <PropLink name="columnSizing.width">width</PropLink> - use this for fixed sized columns
 * <PropLink name="columnSizing.minWidth">minWidth</PropLink> - specifies the minimum width of the column. Useful for flexible columns or for restricting users resizing both fixed and flexible columns.
 * <PropLink name="columnSizing.maxWidth">maxWidth</PropLink> - specifies the maximum width of the column. Useful for flexible columns or for restricting users resizing both fixed and flexible columns.


<Sandpack title="Controlled column sizing">

```tsx file=columnSizing-example.page.tsx
```

</Sandpack>

<Note>

For auto-sizing columns, see <PropLink name="autoSizeColumnsKey" />.

</Note>

</Prop>

<Prop name="columnSizing.flex" type="number">

> Specifies the flex value for the column.

See [using flexible column sizing section](/docs/latest/learn/columns/fixed-and-flexible-size#using-flexible-column-sizing) for more details.

A column can either be flexible or fixed-width. For fixed columns, use <PropLink name="columnSizing.width" /> if you're using <PropLink name="columnSizing" /> or <PropLink name="columns.defaultWidth">column.defaultWidth</PropLink> for default-uncontrolled sizing.

<Sandpack title="Controlled column sizing with flex columns">

```tsx file=columnSizing-example.page.tsx
```

</Sandpack>


</Prop>


<Prop name="columnSizing.minWidth" type="number">

> Specifies the minimum width for a column. Especially useful for flexible columns.

See [Using flexible column sizing](/docs/latest/learn/columns/fixed-and-flexible-size#using-flexible-column-sizing) for more details on the flex algorithm.

This can also be specified for all columns by specyfing <PropLink name="columnMinWidth" />.

<Sandpack title="Controlled column sizing with minWidth for column">

```tsx file=columnSizing-example.page.tsx
```

</Sandpack>
</Prop>


<Prop name="columnSizing.maxWidth" type="number">

> Specifies the maximum width for a column. Especially useful for flexible columns.

See [Using flexible column sizing](/docs/latest/learn/columns/fixed-and-flexible-size#using-flexible-column-sizing) for more details on the flex algorithm.

This can also be specified for all columns by specyfing <PropLink name="columnMaxWidth" />.

<Sandpack title="Controlled column sizing with maxWidth for column">

```tsx file=columnSizing-example.page.tsx
```

</Sandpack>
</Prop>


<Prop name="columnSizing.width" type="number">

> Specifies the fixed width for the column.

See [Using flexible column sizing](/docs/latest/learn/columns/fixed-and-flexible-size#using-flexible-column-sizing) for more details.

A column can either be flexible or fixed. For flexible columns, use <PropLink name="columnSizing.flex" />.


<Sandpack title="Controlled column sizing with fixed column">

```tsx file=columnSizing-example.page.tsx
```

</Sandpack>


</Prop>


<Prop name="columnTypes" type="Record<string,InfiniteTableColumnType>">

> Specifies an object that maps column type ids to column types. Column types are used to apply the same configuration/properties to multiple columns.

<Note>
By default, all columns have the `default` column type applied. So, if you define the `default` column type, but don't specify any <PropLink name="columns.type">type</PropLink> for a column, the default column type properties will be applied to that column.
</Note>



The following properties are currently supported for defining a column type:

 * `align` - See <PropLink name="column.align" />
 * `cssEllipsis` - See <PropLink name="column.cssEllipsis" />
 * `defaultWidth` - default width (uncontrolled) for the column(s) this column type will be applied to. See <PropLink name="column.defaultWidth" />
 * `defaultFlex` - default flex value (uncontrolled) for the column(s) this column type will be applied to. See <PropLink name="column.defaultFlex" />
 * `header` - See <PropLink name="column.header" />
 * `headerCssEllipsis` - See <PropLink name="column.headerCssEllipsis" />
 * `minWidth` - minimum width for the column(s) this column type will be applied to. See <PropLink name="column.minWidth" />
 * `maxWidth` - minimum width for the column(s) this column type will be applied to. See <PropLink name="column.maxWidth" />
 * `render` - render function for the column(s) this column type will be applied to. See <PropLink name="column.render" />
 * `renderValue` - See <PropLink name="column.renderValue" />
 * `valueGetter` - See <PropLink name="column.valueGetter" />
 * `verticalAlign` - See <PropLink name="column.verticalAlign" />
 * `sortable` - See <PropLink name="column.sortable" />
 * `style` - See <PropLink name="column.style" />

<Note>
When any of the properties defined in a column type are also defined in a column (or in column sizing/pinning,etc), the later take precedence so the properties in column type are not applied.
</Note>

</Prop>


<Prop name="columnTypes.defaultFlex" type="number" >

> Specifies a default flex value for the column type. Will be overriden in any column that already specifies a `defaultFlex` property.

See related <PropLink name="columnTypes.defaultWidth" />, <PropLink name="columns.defaultFlex" /> and <PropLink name="columns.defaultWidth" />

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

> Specifies the active cell for keyboard navigation. This is an uncontrolled prop. See the [Keyboard Navigation](/docs/latest/learn/keyboard-navigation/navigating-cells) page for more details.

See <PropLink name="activeCellIndex" /> for the controlled version of this prop and
<PropLink name="keyboardNavigation" /> for the keyboard navigation behavior.

<Sandpack title="Uncontrolled keyboard navigation for cells">

<Description>

This example starts with cell `[2,0]` already active.

</Description>

```ts file=../learn/keyboard-navigation/navigating-cells-uncontrolled-example.page.tsx
```

</Sandpack>

</Prop>

<Prop name="defaultActiveRowIndex" type="number">

> Specifies the active row for keyboard navigation. This is an uncontrolled prop. See the [Keyboard Navigation](/docs/latest/learn/keyboard-navigation/navigating-rows) page for more details.

See <PropLink name="activeRowIndex" /> for the controlled version of this prop and
<PropLink name="keyboardNavigation" /> for the keyboard navigation behavior.

<Sandpack title="Uncontrolled keyboard navigation for rows">

<Description>

This example starts with row at index `2` already active.

</Description>

```ts file=../learn/keyboard-navigation/navigating-rows-uncontrolled-example.page.tsx
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

See [Column Order](/docs/latest/learn/columns/column-order) for more details on ordering columns both programatically and via drag & drop.


<Sandpack title="Uncontrolled column order">

```ts file=defaultColumnOrder-example.page.tsx
```

</Sandpack>
</Prop>

<Prop name="defaultColumnSizing" type="Record<string,{width,flex,...}>">

> Defines a default sizing of columns in the grid.

This is an uncontrolled property. For the controlled version and more details, see <PropLink name="columnSizing" />.

It is an object that maps column ids to column sizing options. The values in the objects can contain the following properties:
 * <PropLink name="defaultColumnSizing.flex">flex</PropLink> - use this for flexible columns. Behaves like the `flex` CSS property.
 * <PropLink name="defaultColumnSizing.width">width</PropLink> - use this for fixed sized columns
 * <PropLink name="defaultColumnSizing.minWidth">minWidth</PropLink> - specifies the minimum width of the column. Useful for flexible columns or for restricting users resizing both fixed and flexible columns.
 * <PropLink name="defaultColumnSizing.maxWidth">maxWidth</PropLink> - specifies the maximum width of the column. Useful for flexible columns or for restricting users resizing both fixed and flexible columns.


<Sandpack title="Uncontrolled column sizing">

```tsx file=defaultColumnSizing-example.page.tsx
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

```ts file=domprops-example.page.tsx
```
```ts file=data.ts
```

</Sandpack>

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

```ts file=focusedStyle-example.page.tsx
```
```ts file=data.ts
```
</Sandpack>
</Prop>

<Prop name="focusedWithinStyle">

> Specifies the `style` to be applied to the component root element when there is focus within (inside) the component.

<Note>

To listen to focusWithin changes, listen to <PropLink name="onFocusWithin" /> and <PropLink name="onBlurWithin" />.

</Note>

<Sandpack title="focusedWithinStyle example - focus an input inside the table to see it in action">

```ts file=focusedWithinStyle-example.page.tsx
```
```ts file=data.ts
```
</Sandpack>

</Prop>

<Prop name="groupColumn" type="InfiniteTableColumn|({options, toggleGroupRow}) => InfiniteTableColumn">

> Allows you to define a custom configuration for one or multiple group columns.

If this is an object and no explicit <PropLink name="groupRenderStrategy" /> is specified, the component is rendered as if you had <PropLink name="groupRenderStrategy">groupRenderStrategy="single-column"</PropLink>.

If it's a function, it will be called with the following arguments:

 * `options` - an object with the following properties:
 * `options.groupCount` - the count of row groups
 * `options.groupBy` - the array of row groups, used by the `DataSource` to do the grouping
 * `options.groupRenderStrategy` - the current <PropLink name="groupRenderStrategy" code={false}>render strategy for groups</PropLink>.
 * `options.groupByForColumn` - the grouping object (one of the items in `options.groupBy`) corresponding to the current column.
 * `options.groupIndexForColumn` - the index of `options.groupByForColumn` in `options.groupBy` - corresponding to the current column.
 * `toggleGroupRow(groupKeys: any[])` - a function you can use to toggle a group row. Pass an array of keys - the path to the group row you want to toggle.

</Prop>

<Prop name="groupRenderStrategy" type="'single-column'|'multi-column'|'inline'">

> Determines how grouping is rendered - whether a single or multiple columns are generated. In case of inline, no group column is generated but the column corresponding to the group field is used.

<Sandpack>

```ts file=groupRenderStrategy-example.page.tsx
```
``` ts file=employee-columns.ts
```

</Sandpack>
</Prop>

<Prop name="hideEmptyGroupColumns" type="boolean" defaultValue={false}>

> Allows you to hide group columns which don't render any information (this happens when all previous groups are collapsed).

<Sandpack>

```ts file=hideEmptyGroupColumns-example.page.tsx
```
``` ts file=employee-columns.ts
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

```ts file=../learn/keyboard-navigation/navigating-cells-uncontrolled-example.page.tsx
```

</Sandpack>

<Sandpack title="Disabled Keyboard navigation">

<Description>

In this example the keyboard navigation is disabled.

</Description>


```ts file=../learn/keyboard-navigation/navigation-disabled-example.page.tsx
```

</Sandpack>

</Prop>

<Prop name="loadingText" type="ReactNode" defaultValue="'Loading'">

> The text inside the load mask - displayed when <DataSourcePropLink name="loading">loading=true</DataSourcePropLink>.


<Sandpack title="Customized loading text">

```ts file=loadingText-example.page.tsx
```
</Sandpack>

</Prop>


<Prop name="onActiveCellIndexChange" type="(activeCellIndex:[number,number])=>void">

> Callback triggered by cell navigation. See the [Keyboard Navigation](/docs/latest/learn/keyboard-navigation/navigating-cells) page for more details.

See related <PropLink name="activeCellIndex" /> and <PropLink name="keyboardNavigation" /> for the keyboard navigation behavior.

<Sandpack title="Controlled keyboard navigation (for cells) with callback">

<Description>

This example uses `onActiveCellIndexChange` to react to changes in the `activeCellIndex`.

</Description>

```ts file=../learn/keyboard-navigation/navigating-cells-controlled-example.page.tsx
```

</Sandpack>

</Prop>

<Prop name="onActiveRowIndexChange" type="(activeRowIndex:number)=>void">

> Callback triggered by row navigation. See the [Keyboard Navigation](/docs/latest/learn/keyboard-navigation/navigating-rows) page for more details.

See related <PropLink name="activeRowIndex" /> and <PropLink name="keyboardNavigation" /> for the keyboard navigation behavior.

<Sandpack title="Controlled keyboard navigation (for rows) with callback">

<Description>

This example uses `onActiveRowIndexChange` to react to changes in the `activeRowIndex`.

</Description>

```ts file=../learn/keyboard-navigation/navigating-rows-controlled-example.page.tsx
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

```ts file=onBlurWithin-example.page.tsx
```
```ts file=data.ts
```
</Sandpack>
</Prop>
<Prop name="onColumnOrderChange" type="(columnOrder: string[])=>void">

> Called as a result of user changing the column order

</Prop>


<Prop name="onColumnSizingChange" type="(columnSizing)=>void">

> Called as a result of user doing a column resize.

Use this callback to get updated information after a column resize is performed.

This works well in combination with the controlled <PropLink name="columnSizing" /> prop (though you don't have to use controlled <PropLink name="columnSizing" /> in order to use this callback). For more info on resizing columns, see [Column Sizing](/docs/latest/learn/columns/fixed-and-flexible-size).

See related <PropLink name="onViewportReservedWidthChange" />

<Sandpack title="Controlled column sizing example with onColumnSizingChange">

```ts file=onColumnSizingChange-example.page.tsx
```

</Sandpack>

</Prop>


<Prop name="onFocusWithin" type="(event)=> void">

> Function that is called when the table receives focus within the component.

For the corresponding blur event, see <PropLink name="onBlurWithin" />

<Sandpack title="Focus an input inside the table to see the callback fired">

```ts file=onFocusWithin-example.page.tsx
```
```ts file=data.ts
```
</Sandpack>
</Prop>


<Prop name="onScrollToBottom" type="()=>void">

> Triggered when the user has scrolled to the bottom of the component

As an example usage, we're demoing live pagination, done in combination with the [react-query](https://react-query.tanstack.com/) library.


<Note>

If you want to scroll to the top of the table, you can use the <PropLink name="scrollTopKey" /> prop.

</Note>

<Sandpack title="Fetch new data on scroll to bottom" deps="react-query">

```ts file=../learn/working-with-data/live-pagination-example.page.tsx
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

```ts file=viewportReservedWidth-example.page.tsx
```
</Sandpack>

</Prop>

<Prop name="pivotGrandTotalColumnPosition" defaultValue={false} type={'"start"|"end"|false'}>

> Controls the position and visibility of pivot grand-total columns

If specified as `false`, the pivot grand-total columns are not displayed.

For normal pivot total columns, see <PropLink name="pivotTotalColumnPosition"/>.


<Sandpack title="Pivoting with pivotGrandTotalColumnPosition=start">

```ts file=pivot-grand-total-column-position-example.page.tsx
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

```ts file=pivot-total-column-position-example.page.tsx
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

```ts file=resizableColumns-example.page.tsx
```
</Sandpack>

</Prop>

<Prop name="rowHeight" type="number|string" defaultValue={40}>

> Specifies the height for rows. If a string is passed, it should be the name of a CSS variable, eg `--row-height`

<Sandpack title="rowHeight as number">

```ts file=rowHeight-number-example.page.tsx
```
```ts file=data.ts
```
</Sandpack>

<Sandpack title="rowHeight from CSS variable name">

```ts file=rowHeight-cssvar-example.page.tsx
```
```ts file=data.ts
```
</Sandpack>


</Prop>

<Prop name="rowClassName" type="string|({data, rowInfo, rowIndex}) => string">

> Specifies the className to be applied to all rows or conditionally to certain rows.

The `rowClassName` prop can be either a string or a function that returns a string. When used as a function, the parameters of the function are the same as the parameters of the <PropLink name="rowStyle" /> function.


</Prop>

<Prop name="rowStyle" type="CSSProperties|({data, rowInfo, rowIndex}) => CSSProperties">

> Specifies the style object to be applied to all rows or conditionally to certain rows.

The `rowStyle` prop can be either an object (typed as `React.CSSProperties`) or a function


### `rowStyle` as a function 

<APIAnatomy>

<AnatomyStep title="data can be null">

When Infinite Table calls `rowStyle`, the `data` property can be null - this is the case for grouped rows.

</AnatomyStep>

<AnatomyStep title="rowInfo">

The `rowInfo` object contains the following properties:
* `id` - the id of the current row
* `data` - the data object
* `indexInAll` - the index in the whole dataset
* `indexInGroup` - the index of the row in the current group
* `groupBy` - the fields used to group the `DataSource`
* `isGroupRow` - whether the row is a group row
* `collapsed` - for a group row, whether the group row is collapsed

See [Using RowInfo](/docs/latest/learn/rows/using-row-info) for more details.

</AnatomyStep>

<AnatomyStep title="return value">

You can either return a valid style object, or undefined.

</AnatomyStep>



```tsx  [[1, 5, "data: Employee | null;"], [2,6,"rowInfo: InfiniteTableRowInfo<Employee>;"], [3,11,"{ background: 'tomato' };"]]
const rowStyle: InfiniteTablePropRowStyle<Employee> = ({
  data,
  rowInfo
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
</APIAnatomy>


<Sandpack title="rowStyle example usage">

```ts file=rowStyle-example.page.tsx
```
```ts file=rowStyle-example-columns.ts
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

```ts file=viewportReservedWidth-example.page.tsx
```
</Sandpack>

</Prop>

<Prop name="scrollTopKey" type="number|string">

> Determines scrolling the table to the top.

Use this property to declaratively tell the `InfiniteTable` component to scroll to the top. Whenever a new value is provided for this property, it will scroll to the top.

<Sandpack title="Declaratively scrolling to the top of the table">

```ts file=scrollTopKey-example.page.tsx
```
</Sandpack>


</Prop>

<Prop name="virtualizeColumns" type="boolean" defaultValue={true}>

> Configures whether columns are virtualized or not

By default, columns are virtualized in order to improve performance.

</Prop>

</PropTable> 

