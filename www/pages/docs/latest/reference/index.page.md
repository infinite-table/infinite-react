---
title: Infinite Table Reference
layout: API
---

In the API Reference below we'll use **`DATA_TYPE`** to refer to the TypeScript type that represents the data the component is bound to.


<PropTable>

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

If a column is explicitly sized via <PropLink name="columnSizing.width" />, that will be used instead.

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

Minimum column width can be controlled more granularly via <PropLink name="columnSizing.minWidth" />, on a per column level.

<Sandpack>

```tsx file=columnMinWidth-example.page.tsx
```

</Sandpack>

</Prop>


<Prop name="columnOrder">

> Defines the order in which columns are displayed in the component

For uncontrolled usage, see <PropLink name="defaultColumnOrder" />.

When using this controlled prop, make sure you also listen to <PropLink name="onColumnOrderChange" />

<Note>

The `columnOrder` array can contain identifiers that are not yet defined in the <PropLink name="columns" /> Map or can contain duplicate ids. This is a feature, not a bug. We want to allow you to use the `columnOrder` in a flexible way so it can define the order of current and future columns.

Displaying the same column twice is a perfectly valid use case.

</Note>


<Sandpack title="Column order">

```ts file=columnOrder-example.page.tsx
```

</Sandpack>
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

If no `header` is specified for a column, the `field` will be used instead.

</Note>

If a function is provided, it will be called with an argument with the following properties:

 * `column`
 * `columnSortInfo` - will allow you to render custom header based on the sort state of the column.

When we implement filtering, you'll also have access to the column filter.


<Sandpack>

```ts file=columns-header-example.page.tsx
```
```ts file=data.ts
```

</Sandpack>
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

<Prop name="columns.rowspan" type="({ rowInfo, data, rowIndex, column }) => number">

> Specifies the rowspan for cells on the current column.

The default rowspan for a column cell is 1. If you want to span multiple rows, return a value that is greater than 1.

This function is called with an object that has the following properties:

* column - the current column
* data - the current data
* rowInfo - information about the current row

The `rowInfo` object contains information about grouping (if this row is a group row, the collapsed state, etc), parent groups, children of the current row (if it's a row group), etc

<Sandpack>

```ts file=column-rowspan-example.page.tsx
```

</Sandpack>

</Prop>

<Prop name="columns.style" type="CSSProperties | (args) => CSSProperties">

> Controls styling for the column. Can be a style object or a function returning a style object.

If defined as a function, it accepts an object as a parameter, which has the following properties:

 * `column` - the current column where the style is being applied
 * `data` - the data object for the current row. The type of this object is `DATA_TYPE | Partial<DATA_TYPE> | null`. For regular rows, it will be of type `DATA_TYPE`, while for group rows it will be `Partial<DATA_TYPE>`. For rows not yet loaded (because of batching being used), it will be `null`.
 * `rowInfo` - the information about the current row - contains details about grouping (if this is a group row, the collapsed state, etc), parent groups, children of the current row, etc
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

<Prop name="columns.defaultFlex" type="number" >

> Specifies a default flex for the column

<Note>

If you want more control on sizing, use controlled <PropLink name="columnSizing" /> (or uncontrolled <PropLink name="defaultColumnSizing" />).
</Note>

See related <PropLink name="columns.defaultWidth" />

</Prop>

<Prop name="columns.defaultWidth" type="number" >

> Specifies a default width for the column

<Note>

If you want more control on sizing, use controlled <PropLink name="columnSizing" /> (or uncontrolled <PropLink name="defaultColumnSizing" />).
</Note>

See related <PropLink name="columns.defaultFlex" />

</Prop>

<Prop name="columnSizing" type="Record<string,{width,flex,...}>">

> Defines the sizing of columns in the grid.

This is a controlled property. For the uncontrolled version, see <PropLink name="defaultColumnSizing" />.

It is an object (or Map) that maps column ids to column sizing options. The values in the objects can contain the following properties:
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

See [fixed vs flexible sizing section](/docs/latest/learn/columns/fixed-and-flexible-size#fixed-vs-flexible-sizing) for more details.

A column can either be flexible or fixed. For fixed columns, use <PropLink name="columnSizing.width" />.


<Sandpack title="Controlled column sizing with flex columns">

```tsx file=columnSizing-example.page.tsx
```

</Sandpack>


</Prop>


<Prop name="columnSizing.minWidth" type="number">

> Specifies the minimum width for a column. Especially useful for flexible columns.

See [fixed vs flexible sizing section](/docs/latest/learn/columns/fixed-and-flexible-size#fixed-vs-flexible-sizing) for more details on the flex algorithm.

This can also be specified for all columns by specyfing <PropLink name="columnMinWidth" />.

<Sandpack title="Controlled column sizing with minWidth for column">

```tsx file=columnSizing-example.page.tsx
```

</Sandpack>
</Prop>


<Prop name="columnSizing.maxWidth" type="number">

> Specifies the maximum width for a column. Especially useful for flexible columns.

See [fixed vs flexible sizing section](/docs/latest/learn/columns/fixed-and-flexible-size#fixed-vs-flexible-sizing) for more details on the flex algorithm.

This can also be specified for all columns by specyfing <PropLink name="columnMaxWidth" />.

<Sandpack title="Controlled column sizing with maxWidth for column">

```tsx file=columnSizing-example.page.tsx
```

</Sandpack>
</Prop>


<Prop name="columnSizing.width" type="number">

> Specifies the fixed width for the column.

See [fixed vs flexible sizing section](/docs/latest/learn/columns/fixed-and-flexible-size#fixed-vs-flexible-sizing) for more details.

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

<Prop name="defaultColumnOrder">

> Defines the order in which columns are displayed in the component.

For controlled usage, see <PropLink name="columnOrder" />.

When using this uncontrolled prop, you can also listen to <PropLink name="onColumnOrderChange" /> to be notified of column order changes

<Note>

The `defaultColumnOrder` array can contain identifiers that are not yet defined in the <PropLink name="columns" /> Map or can contain duplicate ids. This is a feature, not a bug. We want to allow you to use the `defaultColumnOrder` in a flexible way so it can define the order of current and future columns.

Displaying the same column twice is a perfectly valid use case.

</Note>


<Sandpack title="Uncontrolled column order">

```ts file=defaultColumnOrder-example.page.tsx
```

</Sandpack>
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

<Prop name="loadingText" type="ReactNode" defaultValue="'Loading'">

> The text inside the load mask - displayed when <DataSourcePropLink name="loading">loading=true</DataSourcePropLink>.


<Sandpack title="Customized loading text">

```ts file=loadingText-example.page.tsx
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

Coming soon, when we finish implementing column resizing via d&d.

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

<Sandpack title="Using viewportReservedWidth to reserve whitespace when you have flexible columns">

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

