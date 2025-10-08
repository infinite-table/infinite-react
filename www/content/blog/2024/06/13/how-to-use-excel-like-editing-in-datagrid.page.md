---
title: How to use Excel-like editing in your DataGrid
author: admin
date: 2024-06-13
---

Excel-like editing is a very popular request we had. In this short article, we show you how to configure Excel-like editing in the Infinite React DataGrid.

<CSEmbed title="Click a cell and start typing" code={false} id="excel-like-editing-infinite-datagrid-y6xtw6" />

This behavior is achieved by using the [Instant Edit keyboard shorcut](/docs/learn/keyboard-navigation/keyboard-shortcuts#instant-edit).


## Configuring keyboard shortcuts

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

The `instantEdit` [keyboard shorcut](/docs/learn/keyboard-navigation/keyboard-shorcuts) is configured (by default) to respond to any key (via the special `*` identifier which matches anything) and will start editing the cell as soon as a key is pressed. This behavior is the same as in Excel, Google Sheets, Numbers or other spreadsheet software.

<Note>


To enable editing globally, you can use the <PropLink name="columnDefaultEditable" /> boolean prop on the `InfiniteTable` DataGrid component. This will make all columns editable.

Or you can be more specific and choose to make individual columns editable via the <PropLink name="columns.defaultEditable">column.defaultEditable</PropLink> prop. This overrides the global <PropLink name="columnDefaultEditable" />.

</Note>


<HeroCards>
<YouWillLearnCard title="Column Editors" path="/docs/learn/editing/column-editors">
Read about how you can configure various editors for your columns.
</YouWillLearnCard>

<YouWillLearnCard title="Editing Flow Chart" path="/docs/learn/editing/inline-edit-flow">
A picture is worth a thousand words - see a chart for the editing flow.
</YouWillLearnCard>

</HeroCards>


## Finishing an Edit

An edit is generally finished by user interaction - either the user confirms the edit by pressing the `Enter` key or cancels it by pressing the `Escape` key.

As soon as the edit is confirmed by the user, `InfiniteTable` needs to decide whether the edit should be accepted or not.

In order to decide (either synchronously or asynchronously) whether an edit should be accepted or not, you can use the global <PropLink name="shouldAcceptEdit"/> prop or the column-level <PropLink name="columns.shouldAcceptEdit">column.shouldAcceptEdit</PropLink> alternative.

<Note>

When neither the global <PropLink name="shouldAcceptEdit"/> nor the column-level <PropLink name="columns.shouldAcceptEdit">column.shouldAcceptEdit</PropLink> are defined, all edits are accepted by default.

</Note>

<Note>

Once an edit is accepted, the <PropLink name="onEditAccepted"/> callback prop is called, if defined.

When an edit is rejected, the <PropLink name="onEditRejected"/> callback prop is called instead.

The accept/reject status of an edit is decided by using the `shouldAcceptEdit` props described above. However an edit can also be cancelled by the user pressing the `Escape` key in the cell editor - to be notified of this, use the <PropLink name="onEditCancelled"/> callback prop.

</Note>

Using shouldAcceptEdit to decide whether a value is acceptable or not

<Description>

In this example, the `salary` column is configured with a <PropLink name="columns.shouldAcceptEdit">shouldAcceptEdit</PropLink> function property that rejects non-numeric values.

</Description>
<CSEmbed code={false} id="infinite-table-editing-custom-edit-value-2x7nrw"/>

## Persisting an Edit

By default, accepted edits are persisted to the `DataSource` via the <DApiLink name="updateData">DataSourceAPI.updateData</DApiLink> method.

To change how you persist values (which might include persisting to remote locations), use the <PropLink name="persistEdit"/> function prop on the `InfiniteTable` component.

<Note>

The <PropLink name="persistEdit"/> function prop can return a `Promise` for async persistence. To signal that the persisting failed, reject the promise or resolve it with an `Error` object.

After persisting the edit, if all went well, the <PropLink name="onEditPersistSuccess" /> callback prop is called. If the persisting failed (was rejected), the <PropLink name="onEditPersistError" /> callback prop is called instead.

</Note>