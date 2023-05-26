---
title: Editing
description: Learn how to use inline editing to update your data with Infinite Table for React
---

By default, editing is not enabled.

To enable editing globally, you can use the <PropLink name="columnDefaultEditable" /> boolean prop on the `InfiniteTable` component. This will enable the editing on all columns.

Or you can be more specific and choose to make individual columns editable via the <PropLink name="columns.defaultEditable">column.defaultEditable</PropLink> prop. This overrides the global <PropLink name="columnDefaultEditable" />.


<Sandpack title="Inline Editing in action">

<Description>

All columns (except id) are editable.

</Description>

```ts file="inline-editing-example.page.tsx"
```

</Sandpack>



<HeroCards>
<YouWillLearnCard title="Column Editors" path="/docs/learn/editing/column-editors">
Read about how you can configure various editors for your columns.
</YouWillLearnCard>

<YouWillLearnCard title="Editing Flow Chart" path="/docs/learn/editing/inline-edit-flow">
A picture is worth a thousand words - see a chart for the editing flow.
</YouWillLearnCard>

</HeroCards>


<Note>

The <PropLink name="columns.defaultEditable">column.defaultEditable</PropLink> property can be either a `boolean` or a `function`.

If it is a function, it will be called when an edit is triggered on the column. The function will be called with a single object that contains the following properties:

 * `value` - the current value of the cell (the value currently displayed, so after <PropLink name="columns.valueFormatter" /> and <PropLink name="columns.renderValue" /> have been applied)
 * `rawValue` - the current value of the cell, but before any formatting and custom rendering has been applied. This is either the field value from the current data object, or the result of the column <PropLink name="columns.valueGetter">valueGetter</PropLink> function.
 * `data` - the data object (of type `DATA_TYPE`) for the current row
 * `rowInfo` - the row info object that underlies the row
 * `column` - the current column on which editing is invoked
 * `api` - a reference to the [InfiniteTable API](/docs/reference/api)
 * `dataSourceApi` - - a reference to the [DataSource API](/docs/reference/datasource-api)

The function can return a boolean value or a Promise that resolves to a boolean value - this means you can asynchronously decide whether the cell is editable or not.

Making <PropLink name="columns.defaultEditable">column.defaultEditable</PropLink> a function gives you the ability to granularly control which cells are editable or not (even within the same column, based on the cell value or other values you have access to).

</Note>

In addition to the flags mentioned above, you can use the <PropLink name="editable" /> prop on the `InfiniteTable` component. This overrides all other properties and when it is defined, is the only source of truth for whether something is editable or not.

<Note>

The <PropLink name="editable" /> prop allows you to centralize editing logic in one place.

It has the same signature as the <PropLink name="columns.defaultEditable">column.defaultEditable</PropLink> function.

</Note>



## Start Editing

Editing can be started either by user interaction or programmatically via the [API](/docs/reference/api).

The user can start editing by double-clicking on a cell or by pressing the `Enter` key while the cell is active (see [Keyboard Navigation for Cells](docs/learn/keyboard-navigation/navigating-cells)).

To start editing programmatically, use the <ApiLink name="startEdit">{`startEdit({ columnId, rowIndex })`}</ApiLink> method.


<Sandpack title="Starting an Edit via the API">


```ts file="api-inline-editing-custom-edit-value-example.page.tsx"
```

</Sandpack>

Either way, be it user interaction or API call, those actions will trigger checks to see if the cell is editable - taking into account the <PropLink name="columnDefaultEditable"/>, <PropLink name="columns.defaultEditable">column.defaultEditable</PropLink> or <PropLink name="editable" /> props, as described in the paragraphs above. Only if the result is `true` will the cell editor be displayed.

## Customize Edit Value When Editing Starts

When editing starts, the column editor is displayed with the value that was in the cell. This (initial) edit value can be customized via the <PropLink name="columns.getValueToEdit">column.getValueToEdit</PropLink> prop. This allows you to start editing with a different value than the one that is displayed in the cell - and even with a value fetched asynchronously.

```tsx

const columns = {
  salary: {
    field: 'salary',
    // this can return a Promise
    getValueToEdit: ({ value, data, rowInfo, column}) => {
      // suppose the value is a string like '$1000'
      // but we want to start editing with the number 1000
      return value.replace('$', '');
    }
  }
}

```



<Sandpack title="Inline Editing with custom getter for edit value">

<Description>

Try editing the salary column - it has a custom getter for the edit value, which removes the curency string.

</Description>

```ts file="inline-editing-custom-edit-value-example.page.tsx"
```

</Sandpack>

## Finishing an Edit

An edit is generally finished by user interaction - either the user confirms the edit by pressing the `Enter` key or cancels it by pressing the `Escape` key. 

As soon as the edit is confirmed by the user, the `InfiniteTable` needs to decide whether the edit should be accepted or not.

In order to decide (either synchronously or asynchronously) whether an edit should be accepted or not, you can use the global <PropLink name="shouldAcceptEdit"/> prop or the column-level <PropLink name="columns.shouldAcceptEdit">column.shouldAcceptEdit</PropLink> alternative.

<Note>

When neither the global <PropLink name="shouldAcceptEdit"/> nor the column-level <PropLink name="columns.shouldAcceptEdit">column.shouldAcceptEdit</PropLink> are defined, all edits are accepted by default.

</Note>

<Note>

Once an edit is accepted, the <PropLink name="onEditAccepted"/> callback prop is called, if defined.

When an edit is rejected, the <PropLink name="onEditRejected"/> callback prop is called instead.

The accept/reject status of an edit is decided by using the `shouldAcceptEdit` props described above. However an edit can also be cancelled by the user pressing the `Escape` key in the cell editor - to be notified of this, use the <PropLink name="onEditCancelled"/> callback prop.

</Note>


<Sandpack title="Using shouldAcceptEdit to decide whether a value is acceptable or not">

<Description>

In this example, the `salary` column is configured with a <PropLink name="columns.shouldAcceptEdit">shouldAcceptEdit</PropLink> function property that rejects non-numeric values.

</Description>


```ts file="inline-editing-custom-edit-value-example.page.tsx"
```

</Sandpack>

## Persisting an Edit

By default, accepted edits are persisted to the `DataSource` via the <DApiLink name="updateData">DataSourceAPI.updateData</DApiLink> method.

To change how you persist values (which might include persisting to remote locations), use the <PropLink name="persistEdit"/> function prop on the `InfiniteTable` component.

<Note>

The <PropLink name="persistEdit"/> function prop can return a `Promise` for async persistence. To signal that the persisting failed, reject the promise or resolve it with an `Error` object. 

After persisting the edit, if all went well, the <PropLink name="onEditPersistSuccess" /> callback prop is called. If the persisting failed (was rejected), the <PropLink name="onEditPersistError" /> callback prop is called instead.

</Note>

