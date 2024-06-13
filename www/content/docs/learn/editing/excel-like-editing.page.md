---
title: Excel-like Editing
description: Configuring the DataGrid to use Excel-like editing via keyboard shortcuts
---

InfiniteTable offers support for Excel-like editing. This means users can simply start typing in an editable cell and the editor is displayed and updated immediately (no `Enter` key is required to start typing).

This behavior is achieved by using the [Instant Edit keyboard shorcut](/docs/learn/keyboard-navigation/keyboard-shortcuts#instant-edit).


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

The `instantEdit` keyboard shorcut is configured (by default) to respond to any key (via the special `*` identifier which matches anything) and will start editing the cell as soon as a key is pressed. This behavior is the same as in Excel, Google Sheets, Numbers or other spreadsheet software.

<Sandpack>

<Description>

Click on a cell and then start typing to edit the cell.

</Description>

```ts file="$DOCS/reference/keyboard-shortcuts-instant-edit-example.page.tsx"
```

</Sandpack>


<Note>

To confirm the editing, press the `Enter` key.

</Note>