---
title: Infinite Table API
layout: API
---

When rendering the `InfiniteTable` component, you can get access to the API by getting it from the `onReady` callback prop.

```tsx {3}
<InfiniteTable<DATA_TYPE>
  columns={[...]}
  onReady={(api: InfiniteTableApi<DATA_TYPE>) => {
    // api is accessible here
    // you may want to store a reference to it in a ref or somewhere in your app state
  }}
/>
```

For API on row/group selection, see the [Selection API page](./selection-api).

<PropTable>


<Prop name="collapseGroupRow" type="(groupKeys: any[]) => boolean">

> Collapses the specified group row. Returns true if the group was expanded and is now being collapsed.

```tsx
api.collapseGroupRow(['USA','New York']) // collapses the group with these keys
```
</Prop>


<Prop name="expandGroupRow" type="(groupKeys: any[]) => boolean">

> Expands the specified group row. Returns true if the group was collapsed and is now being expanded.

```tsx
api.expandGroupRow(['USA','New York']) // expands the group with these keys
```
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
api.scrollLeft = 200

// use as getter to read the current scroll left value
const scrollLeft = api.scrollLeft
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
api.scrollTop = 1200

// use as getter to read the current scroll top value
const scrollTop = api.scrollTop
```
</Prop>



<Prop name="selectionApi" type="InfiniteTableSelectionApi">

> Getter for the [Selection API](./selection-api)

</Prop>

<Prop name="setColumnOrder" type="(columnIds: string[] | true) => void">

> Set the column order.

If `true` is specified, it resets the column order to the order the columns are specified in the <PropLink name="columns" /> prop (the iteration order of that object).

```ts
api.setColumnOrder(['id', 'firstName','age'])
// restore default order
api.setColumnOrder(true)
```
</Prop>

<Prop name="toggleGroupRow" type="(groupKeys: any[]) => void">

> Toggles the collapse/expand state of the specified group row

```tsx
api.toggleGroupRow(['USA','New York']) // toggle the group with these keys
```
</Prop>





</PropTable> 
