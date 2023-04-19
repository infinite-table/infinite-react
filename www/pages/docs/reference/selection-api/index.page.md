---
title: Infinite Table Selection API
layout: API
---

When rendering the `InfiniteTable` component, you can get access to the [API](./api/) by getting it from the <PropLink name="onReady" /> callback prop. You can retrieve the selection api by reading it from the `api.selectionApi` property.

```tsx {4}

const onReady = ({api}: {api:InfiniteTableApi<DATA_TYPE>}) => {
  // do something with it
  api.selectionApi.selectGroupRow(['USA'])
}

<InfiniteTable<DATA_TYPE>
  columns={[...]}
  onReady={onReady}
/>
```

For the root API, see the [Infinite Table API page](./api).
For column API, see the [Infinite Table Column API page](./column-api).

<PropTable>

<Prop name="allRowsSelected" type="boolean">

> Boolean getter to report whether all the rows are selected or not

</Prop>

<Prop name="deselectGroupRow" type="(groupKeys: any[]) => void">

> Deselects the group row that is identified by the given group keys. Only makes sense when the DataSource is <DPropLink name="groupBy" code={false}>grouped</DPropLink>.

Calling this method triggers a call to <DPropLink name="onRowSelectionChange" >DataSource.onRowSelectionChange</DPropLink>.

For selecting a group row, see related [selectGroupRow](#selectGroupRow).

<Note>

Most often, you don't need to use this imperative way of selecting group rows. Simply update the <DPropLink name="rowSelection">DataSource.rowSelection</DPropLink> to exclude the group row from the selection.

</Note>

</Prop>

<Prop name="deselectRow" type="(primaryKey: any, groupKeys?: any[]) => boolean">

> Deselects the specified row. Optionally provide the group keys, if you have access to them.

See note from [isRowSelected](#isRowSelected) for whether you need to provide the `groupKeys` or not.

Calling this method triggers a call to <DPropLink name="onRowSelectionChange" >DataSource.onRowSelectionChange</DPropLink>.

For selecting the row, see related [selectRow](#selectRow).

<Note>

Most often, you don't need to use this imperative way of deselecting rows. Simply update the <DPropLink name="rowSelection">DataSource.rowSelection</DPropLink> to remove the row you want from the selection.

</Note>

</Prop>

<Prop name="deselectAll" type="() => void">

> Deselects all the rows in the DataSource.

Calling this method triggers a call to <DPropLink name="onRowSelectionChange" >DataSource.onRowSelectionChange</DPropLink>.

For selecting all rows, see related [selectAll](#selectAll).

<Note>

Most often, you don't need to use this imperative way of deselecting all rows. Simply update the <DPropLink name="rowSelection">DataSource.rowSelection</DPropLink> (when multiple row selection is enabled) to a value of

```tsx
{ defaultSelection: false, selectedRows: []}
```

</Note>

</Prop>

<Prop name="getGroupRowSelectionState" type="(groupKeys: any[], rowSelection?: DataSourceRowSelection) => true|false|null">

> Returns the state of a group row - only applicable when the DataSource is <DPropLink name="groupBy" code={false}>grouped</DPropLink>

The returned values can be:

- `true` - the group row and all its children are selected, at any level of nesting
- `false` - the group row and all its children are deselected, at any level of nesting
- `null` - the group row has some (not all) children selected, at any level of nesting

Baiscally, `true` means the group row and all children are selected, `false` means the group row is not selected and doesn't have any selected children, while `null` is the indeterminate state, where just some (but not all) of the children of the group are selected.

If you provide a the value of a `rowSelection`, it will be used as the source of truth for selection. If no value for `rowSelection` is provided, it will use the current row selection.

<Note>

If you don't provide a value for the `rowSelection` and are calling this method in the <DPropLink name="onRowSelectionChange" /> callback prop, you might be one step behind the selection. In such a case, make sure you pass to this function the value you receive in the <DPropLink name="onRowSelectionChange" /> callback.

</Note>

</Prop>

<Prop name="getSelectedPrimaryKeys" type="(rowSelection?: DataSourceRowSelection) => (string|number)[]">

> Retrieves the ids (primary keys) of the selected rows, when the selection contains group keys instead of primary keys (so when <DPropLink name="useGroupKeysForMultiRowSelection" /> is `true` and the DataSource is <DPropLink name="groupBy" code={false}>grouped</DPropLink>).

If you provide a the value of a `rowSelection`, it will be used as the source of truth for retrieving the row ids. If no value for `rowSelection` is provided, it will use the current row selection.

<Note>

This will not work properly when the `DataSource` is configured with <DPropLink name="lazyLoad" code={false}>lazy loading</DPropLink>, since it cannot give you primary keys of rows not yet loaded.

</Note>

<Note>

If you don't provide a value for the `rowSelection` and are calling this method in the <DPropLink name="onRowSelectionChange" /> callback prop, you might be one step behind the selection. In such a case, make sure you pass to this function the value you receive in the <DPropLink name="onRowSelectionChange" /> callback.

</Note>

<Sandpack title="Using getSelectedPrimaryKeys in multi row checkbox selection with grouping" >

<Description>

This example shows how you can use getSelectedPrimaryKeys with multiple row selection to retrieve the actual ids of the selected rows.

</Description>

```ts file="$DOCS/reference/controlled-multi-row-selection-example-with-group-keys.page.tsx"

```

</Sandpack>

</Prop>

<Prop name="isRowSelected" type="(primaryKey: any, groupKeys?: any[]) => boolean">

> Checks if a row specified by its primary key is selected or not. Optionally provide the group keys, if you have access to them.

<Note>
The group keys are not mandatory, and they are useful only when the DataSource is <DPropLink name="groupBy" code={false}>grouped</DPropLink>.

Even if you don't pass them, the component will try to retrieve them from its internal state - note though that in lazy-load scenarios, not all rows/groups may have been loaded, so in this case, you have to make sure you provide the `groupKeys` when calling this method.

</Note>

</Prop>

<Prop name="isRowDeselected" type="(primaryKey: any, groupKeys?: any[]) => boolean">

> Checks if a row specified by its primary key is deselected or not. Optionally provide the group keys, if you have access to them.

See note from [isRowSelected](#isRowSelected)

</Prop>

<Prop name="selectAll" type="() => void">

> Selects all the rows in the DataSource.

Calling this method triggers a call to <DPropLink name="onRowSelectionChange" >DataSource.onRowSelectionChange</DPropLink>.

For deselecting all rows, see related [deselectAll](#deselectAll).

<Note>

Most often, you don't need to use this imperative way of selecting rows. Simply update the <DPropLink name="rowSelection">DataSource.rowSelection</DPropLink> (when multiple row selection is enabled) to a value of

```tsx
{ defaultSelection: true, deselectedRows: []}
```

</Note>

</Prop>

<Prop name="selectGroupRow" type="(groupKeys: any[]) => void">

> Selects the group row that is identified by the given group keys. Only makes sense when the DataSource is <DPropLink name="groupBy" code={false}>grouped</DPropLink>.

Calling this method triggers a call to <DPropLink name="onRowSelectionChange" >DataSource.onRowSelectionChange</DPropLink>.

For deselecting a group row, see related [deselectGroupRow](#deselectGroupRow).

<Note>

Most often, you don't need to use this imperative way of selecting group rows. Simply update the <DPropLink name="rowSelection">DataSource.rowSelection</DPropLink> to include the group row you want to select.

</Note>

</Prop>

<Prop name="selectRow" type="(primaryKey: any, groupKeys?: any[]) => boolean">

> Selects the specified row. Optionally provide the group keys, if you have access to them.

See note from [isRowSelected](#isRowSelected) for whether you need to provide the `groupKeys` or not.

Calling this method triggers a call to <DPropLink name="onRowSelectionChange" >DataSource.onRowSelectionChange</DPropLink>.

For deselecting the row, see related [deselectRow](#deselectRow).

<Note>

Most often, you don't need to use this imperative way of selecting rows. Simply update the <DPropLink name="rowSelection">DataSource.rowSelection</DPropLink> to include the row you want in the selection.

</Note>

</Prop>

<Prop name="toggleGroupRowSelection" type="(groupKeys: any[]) => void">

> Toggles the selection of the group row that is identified by the given group keys. Only makes sense when the DataSource is <DPropLink name="groupBy" code={false}>grouped</DPropLink>.

Calling this method triggers a call to <DPropLink name="onRowSelectionChange" >DataSource.onRowSelectionChange</DPropLink>.

For deselecting a group row, see related [deselectGroupRow](#deselectGroupRow).
For selecting a group row, see related [selectGroupRow](#selectGroupRow).

<Note>

Most often, you don't need to use this imperative way of selecting group rows. Simply update the <DPropLink name="rowSelection">DataSource.rowSelection</DPropLink> to include the group row you want to select.

</Note>

</Prop>

<Prop name="toggleRowSelection" type="(primaryKey: any, groupKeys?: any[]) => boolean">

> Toggles the selection of the specified row. Optionally provide the group keys, if you have access to them.

See note from [isRowSelected](#isRowSelected) for whether you need to provide the `groupKeys` or not.

Calling this method triggers a call to <DPropLink name="onRowSelectionChange" >DataSource.onRowSelectionChange</DPropLink>.

For deselecting the row, see related [deselectRow](#deselectRow).
For selecting the row, see related [selectRow](#selectRow).
For toggling the selection for a group row, see related [toggleGroupRowSelection](#toggleGroupRowSelection).

<Note>

Most often, you don't need to use this imperative way of selecting rows. Simply update the <DPropLink name="rowSelection">DataSource.rowSelection</DPropLink> to include or exclude the given row.

</Note>

</Prop>

</PropTable>
