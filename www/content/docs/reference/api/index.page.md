---
title: Infinite Table API
layout: API
---

When rendering the `InfiniteTable` component, you can get access to the API by getting it from the <PropLink name="onReady" /> callback prop.

```tsx {2}
const onReady = (
  {api, dataSourceApi}: {
    api: InfiniteTableApi<DATA_TYPE>,
    dataSourceApi: DataSourceApi<DATA_TYPE>
  }) => {
  // api is accessible here
  // you may want to store a reference to it in a ref or somewhere in your app state
}

<InfiniteTable<DATA_TYPE>
  columns={[...]}
  onReady={onReady}
/>
```

For API on row/group selection, see the [Selection API page](./selection-api).

<PropTable sort searchPlaceholder="Type to filter API methods">

<Prop name="clearColumnFilter" type="(columnId: string) =>void">

> Clears any filter for the specified column

</Prop>

<Prop name="collapseGroupRow" type="(groupKeys: any[]) => boolean">

> Collapses the specified group row. Returns true if the group was expanded and is now being collapsed.

```tsx
api.collapseGroupRow(['USA', 'New York']); // collapses the group with these keys
```

</Prop>

<Prop name="expandGroupRow" type="(groupKeys: any[]) => boolean">

> Expands the specified group row. Returns true if the group was collapsed and is now being expanded.

```tsx
api.expandGroupRow(['USA', 'New York']); // expands the group with these keys
```

</Prop>

<Prop name="getCellValue" type="({columnId, rowIndex?, primaryKey? }) => any">

> Returns the value for the specified cell. The value is either the raw value (as retrieved via the `field` property of the column or by calling the column <PropLink name="columns.valueGetter">valueGetter</PropLink>) or the formatted value - if the column has a <PropLink name="columns.valueFormatter">valueFormatter</PropLink>.

Call this function with an object that has a `columnId` and either a `rowIndex` or a `primaryKey` property.

See related <ApiLink name="getCellValues" />.

<Note>

This function should not be called during a cell render (eg: in <PropLink name="columns.render"/>/<PropLink name="columns.renderValue"/> or other functions called during render).

</Note>

</Prop>

<Prop name="getCellValues" type="({columnId, rowIndex?, primaryKey? }) => ({value, rawValue, formattedValue })">

> Returns an object with raw and formatted values for the specified cell.

Call this function with an object that has a `columnId` and either a `rowIndex` or a `primaryKey` property.

The returned object has the following properties:

 * `rawValue` - the raw value of the cell - as retrieved from the <PropLink name="columns.field"/> property of the column or by calling the column <PropLink name="columns.valueGetter">valueGetter</PropLink>
 * `formattedValue` - the formatted value of the cell - if the column has a <PropLink name="columns.valueFormatter">valueFormatter</PropLink>, it's the value returned by the formatter, otherwise it's the same as the `rawValue`
 * `value` - it's either `formattedValue` or `rawValue`. If the column has a <PropLink name="columns.valueFormatter">valueFormatter</PropLink>, it's the value returned by the formatter, otherwise it's the `rawValue`

See related <ApiLink name="getCellValue" />.

<Note>

This function should not be called during a cell render (eg: in <PropLink name="columns.render"/>/<PropLink name="columns.renderValue"/> or other functions called during render).

</Note>

</Prop>

<Prop name="getColumnApi" type="(colIdOrIndex: string|number) => InfiniteTableColumnAPI">

> Returns [a column API object](/docs/reference/column-api) bound to the specified column

The parameter can be either a column id or a column index (note this is not the index in all columns, but rather the index in current visible columns).

</Prop>

<Prop name="getVerticalRenderRange" type="() => { renderStartIndex, renderEndIndex }">

> Returns the vertical render range of the table

The vertical render range is the range of rows that are currently rendered in the table viewport.

</Prop>

<Prop name="onReady" type="({ api, dataSourceApi }) => void">

> Called when the table has been layed out and sized and is ready to be used.

This callback prop will be called with an object containing the `api` (which is an instance of `InfiniteTableApi`) and [`dataSourceApi`](/docs/reference/datasource-api) objects.

</Prop>

<Prop name="startEdit" type="({ rowIndex, columnId }) => Promise<boolean>">

> Tries to start editing the cell specified by the given row index and column id.

Returns a promise that resolves to `true` if editing was started, or `false` if editing was not started because the cell is not editable.

See <PropLink name="columns.defaultEditable" /> for more details on how to configure a cell as editable.


<Sandpack title="Starting an Edit via the API">


```ts file="api-start-edit-example.page.tsx"
```

</Sandpack>

</Prop>

<Prop name="scrollCellIntoView" type="(rowIndex: number; colIdOrIndex: string | number) => boolean">

> Can be used to scroll a cell into the visible viewport

If scrolling was successful and the row and column combination was found, it returns `true`, otherwise `false`. The first arg of the function is the row index, while the second one is the column id or the column index (note this is not the index in all columns, but rather the index in current visible columns).

</Prop>

<Prop name="scrollColumnIntoView" type="(colId: string) => boolean">

> Can be used to scroll a column into the visible viewport

If scrolling was successful and the column was found, it returns `true`, otherwise `false`.
The only parameter of this method is the column id.

</Prop>

<Prop name="scrollLeft" type="getter<number>|setter<number>">

> Gets or sets the `scrollLeft` value in the grid viewport

Can be used as either a setter, to set the scroll left position or a getter to read the scroll left position.

```ts
// use as setter - will scroll the table viewport
api.scrollLeft = 200;

// use as getter to read the current scroll left value
const scrollLeft = api.scrollLeft;
```

</Prop>

<Prop name="scrollRowIntoView" type="(rowIndex: number) => boolean">

> Can be used to scroll a row into the visible viewport

If scrolling was successful and the row was found, it returns `true`, otherwise `false`

</Prop>

<Prop name="scrollTop" type="getter<number>|setter<number>">

> Gets or sets the `scrollTop` value in the grid viewport

Can be used as either a setter, to set the scroll top position or a getter to read the scroll top position.

```ts
// use as setter - will scroll the table viewport
api.scrollTop = 1200;

// use as getter to read the current scroll top value
const scrollTop = api.scrollTop;
```

</Prop>

<Prop name="selectionApi" type="InfiniteTableSelectionApi">

> Getter for the [Selection API](./selection-api)

</Prop>

<Prop name="setColumnFilter" type="(columnId: string, value: any) =>void">

> Sets a filter value for the specified column

</Prop>




<Prop name="setColumnOrder" type="(columnIds: string[] | true) => void">

> Set the column order.

If `true` is specified, it resets the column order to the order the columns are specified in the <PropLink name="columns" /> prop (the iteration order of that object).

```ts
api.setColumnOrder(['id', 'firstName', 'age']);
// restore default order
api.setColumnOrder(true);
```

</Prop>

<Prop name="toggleGroupRow" type="(groupKeys: any[]) => void">

> Toggles the collapse/expand state of the specified group row

```tsx
api.toggleGroupRow(['USA', 'New York']); // toggle the group with these keys
```

</Prop>

</PropTable>
