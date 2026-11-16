---
title: Excel-like Editing
description: Configuring the DataGrid to use Excel-like editing via keyboard shortcuts
---

InfiniteTable offers support for Excel-like editing. This means users can simply start typing in an editable cell and the editor is displayed and updated immediately (no `Enter` key is required to start typing).

This behavior is achieved by using the [Instant Edit keyboard shorcut](/docs/learn/keyboard-navigation/keyboard-shortcuts#instant-edit).


```ts file="excel-like-editing.snippet.tsx" region="intro"
```

The `instantEdit` keyboard shorcut is configured (by default) to respond to any key (via the special `*` identifier which matches anything) and will start editing the cell as soon as a key is pressed. This behavior is the same as in Excel, Google Sheets, Numbers or other spreadsheet software.

<DemoDescription>

Click on a cell and then start typing to edit the cell.

</DemoDescription>

```tsx file="/docs/reference/keyboard-shortcuts-instant-edit-example.demo.tsx"
```


<Note>

To confirm the editing, press the `Enter` key.

</Note>

## Simulating formulas with `column.valueGetter`

You can use the <PropLink name="columns.valueGetter" /> property to simulate formulas in your cells.

For example, you might want to have a column that multiplies or divides a value by a constant.

```ts file="excel-like-editing.snippet.tsx" region="simulating-formulas-with-column-valuegetter"
```


<DemoDescription>

Edit the `salary` column and see the `Salary (thousands)` col update.

</DemoDescription>

```tsx file="/docs/reference/keyboard-shortcuts-instant-edit-with-valuegetter-example.demo.tsx"
```