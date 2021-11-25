---
title: Infinite Table Reference
layout: API
---

In the API Reference below we'll use **`DATA_TYPE`** to refer to the TypeScript type that represents the data the component is bound to.


<PropTable>

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

<Prop name="columnDefaultWidth" type="number">

> Specifies the a default width for all columns.

<Note>

If a column explicitly specifies a `width`, that will be used instead.

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


<Prop name="columnMaxWidth" type="number">

> Specifies the maximum width for all columns.


For specifying the minimum column width, see <PropLink name="columnMinWidth" />. This will be very useful once flex column sizing lands.

</Prop>

<Prop name="columnMinWidth" type="number">

> Specifies the minimum width for all columns.


For specifying the maximum column width, see <PropLink name="columnMaxWidth" />. This will be very useful once flex column sizing lands.

</Prop>

<Prop name="columns" type="Map<string, InfiniteTableColumn<DATA_TYPE>>">

> Describes the columns available in the component.

The following properties are available:

 * <PropLink name="columns.field">field</PropLink>
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

<Prop name="columns.width" type="number">

> Specifies the fixed width of the column. NOTE - will probably be deprecated in the near future, for a better API.

<Note>

A default column with can be specified for all columns by setting the <PropLink name="columnDefaultWidth" /> prop.

</Note>

<Sandpack>

```ts file=columns-width-example.page.tsx
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

When Infinite Table will call `rowStyle`, the `data` property can be null - this is the case for grouped rows.

</AnatomyStep>

<AnatomyStep title="rowInfo object contains additional details">

The `rowInfo` object contains the following properties:
* `id` - the id of the current row
* `data` - the data object
* `indexInAll` - the index in the whole dataset
* `indexInGroup` - the index of the row in the current group
* `groupBy` - the fields used to group the `DataSource`
* `isGroupRow` - whether the row is a group row
* `collapsed` - for a group row, whether the group row is collapsed

</AnatomyStep>

<AnatomyStep title="return a style object or undefined">

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

</PropTable> 

